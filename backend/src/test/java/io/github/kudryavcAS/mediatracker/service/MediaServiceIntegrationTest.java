package io.github.kudryavcAS.mediatracker.service;

import io.github.kudryavcAS.mediatracker.AbstractIntegrationTest;
import io.github.kudryavcAS.mediatracker.dto.MediaItemRequest;
import io.github.kudryavcAS.mediatracker.dto.MediaItemResponse;
import io.github.kudryavcAS.mediatracker.model.MediaFormat;
import io.github.kudryavcAS.mediatracker.model.WatchStatus;
import io.github.kudryavcAS.mediatracker.repo.WatchLogRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@Transactional
class MediaServiceIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MediaService mediaService;

    @Autowired
    private WatchLogRepository watchLogRepository;

    @Test
    void deletingMovieCascadesToItsWatchLogs() {
        MediaItemResponse created = mediaService.createItem(new MediaItemRequest(
                "MOVIE", "Interstellar", MediaFormat.LIVE_ACTION,
                2014, 169, "Christopher Nolan", WatchStatus.PLANNED, null, null
        ));

        mediaService.markAsCompleted(created.id(), null);
        assertThat(watchLogRepository.findAll()).isNotEmpty();

        mediaService.deleteItem(created.id());

        assertThatThrownBy(() -> mediaService.getItemById(created.id()))
                .isInstanceOf(EntityNotFoundException.class);

        boolean anyLogStillReferencesDeletedItem = watchLogRepository.findAll().stream()
                .anyMatch(log -> log.getMediaItem().getId().equals(created.id()));
        assertThat(anyLogStillReferencesDeletedItem).isFalse();
    }

    @Test
    void archivingHidesItemFromDefaultListButKeepsItAccessible() {
        MediaItemResponse created = mediaService.createItem(new MediaItemRequest(
                "MOVIE", "Shutter Island", MediaFormat.LIVE_ACTION,
                1999, 138, "Martin Scorsese", WatchStatus.PLANNED, null, null
        ));

        mediaService.setArchived(created.id(), true);

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

        MediaItemResponse afterProgress = mediaService.updateSeriesProgress(created.id(), 2, null);

        assertThat(afterProgress.watchedEpisodes()).isEqualTo(2);
        assertThat(afterProgress.status()).isEqualTo(WatchStatus.WATCHING);

        long loggedMinutes = watchLogRepository.findAll().stream()
                .filter(log -> log.getMediaItem().getId().equals(created.id()))
                .mapToLong(log -> log.getMinutesWatched())
                .sum();

        // 600 total minutes / 10 episodes * 2 watched = 120
        assertThat(loggedMinutes).isEqualTo(120);
    }
}