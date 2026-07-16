package io.github.kudryavcAS.mediatracker.service;

import io.github.kudryavcAS.mediatracker.dto.ChartDataResponse;
import io.github.kudryavcAS.mediatracker.dto.StatisticsResponse;
import io.github.kudryavcAS.mediatracker.dto.WatchDetailResponse;
import io.github.kudryavcAS.mediatracker.model.MediaFormat;
import io.github.kudryavcAS.mediatracker.repo.ChartDataProjection;
import io.github.kudryavcAS.mediatracker.repo.MediaItemRepository;
import io.github.kudryavcAS.mediatracker.repo.StatsProjection;
import io.github.kudryavcAS.mediatracker.repo.WatchLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class StatsService {

    private final MediaItemRepository mediaRepository;
    private final WatchLogRepository watchLogRepository;

    @Transactional(readOnly = true)
    public StatisticsResponse getOverallStatistics() {
        log.debug("Calculating overall statistics from DB...");
        StatsProjection proj = mediaRepository.getOverallStatistics();

        if (proj == null) {
            log.warn("Stats projection returned null, returning empty stats.");
            return new StatisticsResponse(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        }

        return new StatisticsResponse(
                proj.getTotalItems(), proj.getMovieCount(), proj.getSeriesCount(),
                proj.getCompletedCount(), proj.getWatchingCount(), proj.getPlannedCount(), proj.getDroppedCount(),
                proj.getTotalDuration(), proj.getWatchedDuration(),
                proj.getLiveActionWatched(), proj.getAnimeWatched(), proj.getAnimationWatched()
        );
    }

    @Transactional(readOnly = true)
    public List<ChartDataResponse> getChartData(LocalDate start, LocalDate end, String grouping) {
        log.debug("Fetching chart data from {} to {} with grouping {}", start, end, grouping);

        LocalDateTime startTime = start.atStartOfDay();
        LocalDateTime endTime = end.atTime(23, 59, 59);

        List<ChartDataProjection> rawData = switch (grouping.toUpperCase()) {
            case "WEEK" -> watchLogRepository.getWeeklyActivity(startTime, endTime);
            case "MONTH" -> watchLogRepository.getMonthlyActivity(startTime, endTime);
            default -> watchLogRepository.getDailyActivity(startTime, endTime);
        };

        return rawData.stream()
                .map(d -> new ChartDataResponse(
                        d.getWatchDate(), d.getTotalMinutes(), d.getMovieMinutes(), d.getSeriesMinutes(),
                        d.getLiveActionMinutes(), d.getAnimeMinutes(), d.getAnimationMinutes()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<WatchDetailResponse> getWatchDetails(String dateKey, String grouping) {
        log.debug("Fetching watch details for dateKey: {}, grouping: {}", dateKey, grouping);

        return watchLogRepository.findLogDetailsByDateKey(dateKey, grouping.toUpperCase())
                .stream()
                .map(p -> new WatchDetailResponse(
                        p.getLogId(),
                        p.getMediaItemId(),
                        p.getTitle(),
                        p.getContentType(),
                        MediaFormat.valueOf(p.getFormat()),
                        p.getMinutesWatched(),
                        p.getEpisodes(),
                        p.getWatchedAt()
                ))
                .toList();
    }
}