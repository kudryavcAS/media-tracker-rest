package io.github.kudryavcAS.mediatracker.service;

import io.github.kudryavcAS.mediatracker.AbstractIntegrationTest;
import io.github.kudryavcAS.mediatracker.dto.MediaItemRequest;
import io.github.kudryavcAS.mediatracker.dto.MediaItemResponse;
import io.github.kudryavcAS.mediatracker.model.MediaFormat;
import io.github.kudryavcAS.mediatracker.model.WatchStatus;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@Transactional
class BackupServiceIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MediaService mediaService;

    @Autowired
    private BackupService backupService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EntityManager entityManager;

    @Test
    void exportThenImportRestoresLibraryStateExactly() throws Exception {
        MediaItemResponse movie = mediaService.createItem(new MediaItemRequest(
                "MOVIE", "Interstellar", MediaFormat.LIVE_ACTION,
                2014, 169, "Christopher Nolan", WatchStatus.PLANNED, null, null
        ));
        mediaService.markAsCompleted(movie.id(), null);

        MediaItemResponse series = mediaService.createItem(new MediaItemRequest(
                "SERIES", "Breaking Bad", MediaFormat.LIVE_ACTION,
                2008, 600, "Vince Gilligan", WatchStatus.PLANNED, 10, 0
        ));
        mediaService.updateSeriesProgress(series.id(), 3, null);

        MediaItemResponse archivedMovie = mediaService.createItem(new MediaItemRequest(
                "MOVIE", "Shutter Island", MediaFormat.LIVE_ACTION,
                2010, 138, "Martin Scorsese", WatchStatus.PLANNED, null, null
        ));
        mediaService.setArchived(archivedMovie.id(), true);

        entityManager.flush();
        entityManager.clear();

        byte[] exported = backupService.exportData();

        Integer mediaItemCountBefore = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM media_item", Integer.class);
        Integer watchLogCountBefore = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM watch_log", Integer.class);

        MockMultipartFile backupFile = new MockMultipartFile(
                "file", "backup.json", "application/json", exported);
        backupService.importData(backupFile);

        entityManager.clear();

        Integer mediaItemCountAfter = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM media_item", Integer.class);
        Integer watchLogCountAfter = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM watch_log", Integer.class);

        assertThat(mediaItemCountAfter).isEqualTo(mediaItemCountBefore);
        assertThat(watchLogCountAfter).isEqualTo(watchLogCountBefore);
        assertThat(mediaItemCountAfter).isEqualTo(3);

        MediaItemResponse restoredMovie = mediaService.getItemById(movie.id());
        assertThat(restoredMovie.title()).isEqualTo("Interstellar");
        assertThat(restoredMovie.status()).isEqualTo(WatchStatus.COMPLETED);

        MediaItemResponse restoredSeries = mediaService.getItemById(series.id());
        assertThat(restoredSeries.watchedEpisodes()).isEqualTo(3);

        var withArchived = mediaService.getFilteredItems(null, null, null, null, true, 1, 50);
        assertThat(withArchived.getContent())
                .extracting(MediaItemResponse::id)
                .contains(archivedMovie.id());
        assertThat(mediaService.getItemById(archivedMovie.id()).archived()).isTrue();

        var withoutArchived = mediaService.getFilteredItems(null, null, null, null, false, 1, 50);
        assertThat(withoutArchived.getContent())
                .extracting(MediaItemResponse::id)
                .doesNotContain(archivedMovie.id());
    }

    @Test
    void importWipesExistingDataBeforeRestoring() throws Exception {
        mediaService.createItem(new MediaItemRequest(
                "MOVIE", "One Flew Over the Cuckoo's Nest", MediaFormat.LIVE_ACTION,
                1975, 135, "Miloš Forman", WatchStatus.PLANNED, null, null
        ));

        entityManager.flush();
        entityManager.clear();

        String emptyBackupJson = """
                {"mediaItems":[],"watchLogs":[]}
                """;
        MockMultipartFile backupFile = new MockMultipartFile(
                "file", "backup.json", "application/json", emptyBackupJson.getBytes());

        backupService.importData(backupFile);
        entityManager.clear();

        Integer mediaItemCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM media_item", Integer.class);
        assertThat(mediaItemCount).isEqualTo(0);
    }
}