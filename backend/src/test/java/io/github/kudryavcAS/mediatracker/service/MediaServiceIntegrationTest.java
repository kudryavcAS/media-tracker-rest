package io.github.kudryavcAS.mediatracker.service;

import io.github.kudryavcAS.mediatracker.AbstractIntegrationTest;
import io.github.kudryavcAS.mediatracker.dto.MediaItemRequest;
import io.github.kudryavcAS.mediatracker.dto.MediaItemResponse;
import io.github.kudryavcAS.mediatracker.model.MediaFormat;
import io.github.kudryavcAS.mediatracker.model.WatchStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@Transactional
class MediaServiceIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MediaService mediaService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EntityManager entityManager;

    @Test
    void deletingMovieCascadesToItsWatchLogs() {
        MediaItemResponse created = mediaService.createItem(new MediaItemRequest(
                "MOVIE", "Interstellar", MediaFormat.LIVE_ACTION,
                2014, 169, "Christopher Nolan", WatchStatus.PLANNED, null, null
        ));
        entityManager.flush();
        entityManager.clear();

        mediaService.markAsCompleted(created.id(), null);
        entityManager.flush();
        entityManager.clear();

        Integer logsBeforeDelete = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM watch_log WHERE media_item_id = ?", Integer.class, created.id());
        assertThat(logsBeforeDelete).isEqualTo(1);

        mediaService.deleteItem(created.id());
        entityManager.flush();
        entityManager.clear();

        assertThatThrownBy(() -> mediaService.getItemById(created.id()))
                .isInstanceOf(EntityNotFoundException.class);

        Integer logsAfterDelete = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM watch_log WHERE media_item_id = ?", Integer.class, created.id());
        assertThat(logsAfterDelete).isEqualTo(0);
    }

    @Test
    void archivingHidesItemFromDefaultListButKeepsItAccessible() {
        MediaItemResponse created = mediaService.createItem(new MediaItemRequest(
                "MOVIE", "Shutter Island", MediaFormat.LIVE_ACTION,
                2010, 138, "Martin Scorsese", WatchStatus.PLANNED, null, null
        ));
        entityManager.flush();
        entityManager.clear();

        mediaService.setArchived(created.id(), true);
        entityManager.flush();
        entityManager.clear();

        var visiblePage = mediaService.getFilteredItems(null, null, null, null, false, 1, 50);
        assertThat(visiblePage.getContent())
                .extracting(MediaItemResponse::id)
                .doesNotContain(created.id());

        var includingArchivedPage = mediaService.getFilteredItems(null, null, null, null, true, 1, 50);
        assertThat(includingArchivedPage.getContent())
                .extracting(MediaItemResponse::id)
                .contains(created.id());

        MediaItemResponse stillReadable = mediaService.getItemById(created.id());
        assertThat(stillReadable.archived()).isTrue();
    }

    @Test
    void seriesProgressAccumulatesWatchedMinutesCorrectly() {
        MediaItemResponse created = mediaService.createItem(new MediaItemRequest(
                "SERIES", "Breaking Bad", MediaFormat.LIVE_ACTION,
                2008, 600, "Vince Gilligan", WatchStatus.PLANNED, 10, 0
        ));
        entityManager.flush();
        entityManager.clear();

        MediaItemResponse afterProgress = mediaService.updateSeriesProgress(created.id(), 2, null);
        entityManager.flush();
        entityManager.clear();

        assertThat(afterProgress.watchedEpisodes()).isEqualTo(2);
        assertThat(afterProgress.status()).isEqualTo(WatchStatus.WATCHING);

        Integer loggedMinutes = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(minutes_watched), 0) FROM watch_log WHERE media_item_id = ?",
                Integer.class, created.id());

        assertThat(loggedMinutes).isEqualTo(120);
    }
}