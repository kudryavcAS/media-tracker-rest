package io.github.kudryavcAS.mediatracker.dto;

import io.github.kudryavcAS.mediatracker.model.MediaFormat;
import io.github.kudryavcAS.mediatracker.model.WatchStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record BackupDataDto(
        List<MediaItemBackupDto> mediaItems,
        List<WatchLogBackupDto> watchLogs
) {
    public record MediaItemBackupDto(
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
            LocalDateTime createdAt,
            boolean isDeleted
    ) {
    }

    public record WatchLogBackupDto(
            UUID id,
            UUID mediaItemId,
            LocalDateTime watchedAt,
            Integer minutesWatched,
            Integer episodes
    ) {
    }
}