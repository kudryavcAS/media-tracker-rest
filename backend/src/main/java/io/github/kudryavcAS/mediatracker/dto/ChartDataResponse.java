package io.github.kudryavcAS.mediatracker.dto;

public record ChartDataResponse(
        String watchDate,
        long totalMinutes,
        long movieMinutes,
        long seriesMinutes,
        long liveActionMinutes,
        long animeMinutes,
        long animationMinutes,
        long movieLiveActionMinutes,
        long movieAnimeMinutes,
        long movieAnimationMinutes,
        long seriesLiveActionMinutes,
        long seriesAnimeMinutes,
        long seriesAnimationMinutes
) {
}