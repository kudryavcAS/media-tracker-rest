package io.github.kudryavcAS.mediatracker.dto;

import io.github.kudryavcAS.mediatracker.model.MediaFormat;
import java.time.LocalDateTime;
import java.util.UUID;

public record WatchDetailResponse(
        UUID logId,
        UUID mediaItemId,
        String title,
        String contentType,
        MediaFormat format,
        Integer minutesWatched,
        Integer episodes,
        LocalDateTime watchedAt
) {
}