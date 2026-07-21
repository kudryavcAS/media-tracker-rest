package io.github.kudryavcAS.mediatracker.controller;

import io.github.kudryavcAS.mediatracker.dto.ChartDataResponse;
import io.github.kudryavcAS.mediatracker.dto.StatisticsResponse;
import io.github.kudryavcAS.mediatracker.dto.WatchDetailResponse;
import io.github.kudryavcAS.mediatracker.service.StatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/stats")
@RequiredArgsConstructor
@Tag(name = "Statistics", description = "Endpoints for user statistics and analytics")
public class StatsController {

    private final StatsService statsService;

    @GetMapping
    @Operation(summary = "Get overall statistics",
            description = "Aggregated snapshot of the current library state (includes watch history predating the app; excludes archived items)")
    public StatisticsResponse getOverallStats() {
        log.info("REST request to get overall statistics");
        return statsService.getOverallStatistics();
    }

    @GetMapping("/chart")
    @Operation(summary = "Get chart data",
            description = "Time-distributed watch activity based on logged events only. Includes archived items (archiving does not remove logs); watch logs of deleted items no longer exist, since deletion cascades. Data exists only from the point logging started.")
    public List<ChartDataResponse> getChartData(
            @Parameter(description = "Start date (YYYY-MM-DD)") @RequestParam LocalDate start,
            @Parameter(description = "End date (YYYY-MM-DD)") @RequestParam LocalDate end,
            @Parameter(description = "Grouping period (DAY, WEEK, MONTH)") @RequestParam(defaultValue = "DAY") String grouping
    ) {
        log.info("REST request to get chart data");
        return statsService.getChartData(start, end, grouping);
    }

    @GetMapping("/details")
    @Operation(summary = "Get watch details",
            description = "Returns specific watch logs for a given date period")
    public List<WatchDetailResponse> getWatchDetails(
            @Parameter(description = "Date key (e.g. 2026-07-15)") @RequestParam String dateKey,
            @Parameter(description = "Grouping period (DAY, WEEK, MONTH)") @RequestParam(defaultValue = "DAY") String grouping
    ) {
        log.info("REST request to get watch details");
        return statsService.getWatchDetails(dateKey, grouping);
    }
}