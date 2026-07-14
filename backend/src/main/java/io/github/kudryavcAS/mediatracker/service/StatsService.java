package io.github.kudryavcAS.mediatracker.service;

import io.github.kudryavcAS.mediatracker.dto.StatisticsResponse;
import io.github.kudryavcAS.mediatracker.repo.MediaItemRepository;
import io.github.kudryavcAS.mediatracker.repo.StatsProjection;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class StatsService {

    private final MediaItemRepository mediaRepository;

    @Transactional(readOnly = true)
    public StatisticsResponse getOverallStatistics() {
        log.debug("Calculating overall statistics from DB...");
        StatsProjection proj = mediaRepository.getOverallStatistics();

        if (proj == null) {
            log.warn("Stats projection returned null, returning empty stats.");
            return new StatisticsResponse(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        }

        return new StatisticsResponse(
                proj.getTotalItems(),
                proj.getMovieCount(),
                proj.getSeriesCount(),
                proj.getCompletedCount(),
                proj.getWatchingCount(),
                proj.getPlannedCount(),
                proj.getDroppedCount(),
                proj.getTotalDuration(),
                proj.getWatchedDuration(),
                proj.getLiveActionWatched(),
                proj.getAnimeWatched(),
                proj.getAnimationWatched()
        );
    }
}