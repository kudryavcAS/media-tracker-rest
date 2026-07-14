package io.github.kudryavcAS.mediatracker.dto;

public record StatisticsResponse(
        long totalItems,
        long movieCount,
        long seriesCount,

        long completedCount,
        long watchingCount,
        long plannedCount,
        long droppedCount,

        long totalDurationMinutes,
        long watchedDurationMinutes,

        long liveActionWatchedMinutes,
        long animeWatchedMinutes,
        long animationWatchedMinutes
) {
}