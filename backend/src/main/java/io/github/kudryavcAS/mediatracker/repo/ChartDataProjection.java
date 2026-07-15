package io.github.kudryavcAS.mediatracker.repo;

public interface ChartDataProjection {
    String getWatchDate();
    Long getTotalMinutes();
    Long getMovieMinutes();
    Long getSeriesMinutes();
    Long getLiveActionMinutes();
    Long getAnimeMinutes();
    Long getAnimationMinutes();
}