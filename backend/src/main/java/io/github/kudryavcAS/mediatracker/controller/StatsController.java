package io.github.kudryavcAS.mediatracker.controller;

import io.github.kudryavcAS.mediatracker.dto.StatisticsResponse;
import io.github.kudryavcAS.mediatracker.service.StatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/stats")
@RequiredArgsConstructor
@Tag(name = "Statistics", description = "Endpoints for user statistics and analytics")
public class StatsController {

    private final StatsService statsService;

    @GetMapping
    @Operation(summary = "Get overall statistics", description = "Returns aggregated data about library size and watch time")
    public StatisticsResponse getOverallStats() {
        log.info("REST request to get overall statistics");
        return statsService.getOverallStatistics();
    }
}