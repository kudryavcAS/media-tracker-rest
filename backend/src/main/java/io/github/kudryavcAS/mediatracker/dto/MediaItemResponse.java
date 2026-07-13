package io.github.kudryavcAS.mediatracker.dto;

import io.github.kudryavcAS.mediatracker.model.MediaFormat;
import io.github.kudryavcAS.mediatracker.model.WatchStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record MediaItemResponse(
        UUID id,
        String contentType,
        String title,
        MediaFormat format,
        Integer releaseYear,
        Integer durationMinutes,
        String directors,
        WatchStatus status,
        Integer totalEpisodes,
        Integer watchedEpisodes,
        LocalDateTime createdAt
) {
}