package io.github.kudryavcAS.mediatracker.service;

import io.github.kudryavcAS.mediatracker.AbstractIntegrationTest;
import io.github.kudryavcAS.mediatracker.dto.ChartDataResponse;
import io.github.kudryavcAS.mediatracker.dto.MediaItemRequest;
import io.github.kudryavcAS.mediatracker.dto.MediaItemResponse;
import io.github.kudryavcAS.mediatracker.dto.StatisticsResponse;
import io.github.kudryavcAS.mediatracker.model.MediaFormat;
import io.github.kudryavcAS.mediatracker.model.WatchStatus;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@Transactional
class StatsServiceIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MediaService mediaService;

    @Autowired
    private StatsService statsService;

    @Autowired
    private EntityManager entityManager;

    @Test
    void overallStatisticsExcludesArchivedItemsAndBreaksDownByFormatAndStatus() {
        MediaItemResponse movie = mediaService.createItem(new MediaItemRequest(
                "MOVIE", "Interstellar", MediaFormat.LIVE_ACTION,
                2014, 169, "Christopher Nolan", WatchStatus.PLANNED, null, null
        ));
        mediaService.markAsCompleted(movie.id(), null);

        MediaItemResponse anime = mediaService.createItem(new MediaItemRequest(
                "SERIES", "Attack on Titan", MediaFormat.ANIME,
                2013, 250, "Hajime Isayama", WatchStatus.PLANNED, 25, 0
        ));
        mediaService.updateSeriesProgress(anime.id(), 5, null);

        MediaItemResponse archivedMovie = mediaService.createItem(new MediaItemRequest(
                "MOVIE", "Shutter Island", MediaFormat.LIVE_ACTION,
                2010, 138, "Martin Scorsese", WatchStatus.COMPLETED, null, null
        ));
        mediaService.setArchived(archivedMovie.id(), true);

        entityManager.flush();
        entityManager.clear();

        StatisticsResponse stats = statsService.getOverallStatistics();

        assertThat(stats.totalItems()).isEqualTo(2);
        assertThat(stats.movieCount()).isEqualTo(1);
        assertThat(stats.seriesCount()).isEqualTo(1);
        assertThat(stats.completedCount()).isEqualTo(1);
        assertThat(stats.watchingCount()).isEqualTo(1);

        // 169 (movie total) + 250 (series total) — archived Shutter Island excluded
        assertThat(stats.totalDurationMinutes()).isEqualTo(419);

        // movie fully watched (169) + anime 5/25 episodes of 250 total = 50
        assertThat(stats.watchedDurationMinutes()).isEqualTo(219);
        assertThat(stats.liveActionWatchedMinutes()).isEqualTo(169);
        assertThat(stats.animeWatchedMinutes()).isEqualTo(50);
    }

    @Test
    void chartDataIncludesArchivedLogsButLosesThemAfterHardDeleteCascade() {
        MediaItemResponse movie = mediaService.createItem(new MediaItemRequest(
                "MOVIE", "Interstellar", MediaFormat.LIVE_ACTION,
                2014, 169, "Christopher Nolan", WatchStatus.PLANNED, null, null
        ));

        LocalDateTime watchedAt = LocalDateTime.of(2026, 7, 15, 20, 0);
        mediaService.markAsCompleted(movie.id(), watchedAt);
        mediaService.setArchived(movie.id(), true);

        entityManager.flush();
        entityManager.clear();

        List<ChartDataResponse> chartBeforeDelete = statsService.getChartData(
                LocalDate.of(2026, 7, 15), LocalDate.of(2026, 7, 15), "DAY");

        assertThat(chartBeforeDelete).hasSize(1);
        assertThat(chartBeforeDelete.get(0).totalMinutes()).isEqualTo(169);
        assertThat(chartBeforeDelete.get(0).movieMinutes()).isEqualTo(169);
        assertThat(chartBeforeDelete.get(0).liveActionMinutes()).isEqualTo(169);

        mediaService.deleteItem(movie.id());
        entityManager.flush();
        entityManager.clear();

        List<ChartDataResponse> chartAfterDelete = statsService.getChartData(
                LocalDate.of(2026, 7, 15), LocalDate.of(2026, 7, 15), "DAY");

        assertThat(chartAfterDelete).hasSize(1);
        assertThat(chartAfterDelete.get(0).totalMinutes()).isZero();
    }
}