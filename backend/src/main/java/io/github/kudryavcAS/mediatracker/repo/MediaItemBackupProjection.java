package io.github.kudryavcAS.mediatracker.repo;

import java.time.LocalDateTime;
import java.util.UUID;

public interface MediaItemBackupProjection {
    UUID getId();
    String getContentType();
    String getTitle();
    String getFormat();
    Integer getReleaseYear();
    Integer getDurationMinutes();
    String getDirectors();
    String getStatus();
    Integer getTotalEpisodes();
    Integer getWatchedEpisodes();
    LocalDateTime getCreatedAt();
    Boolean getIsDeleted();
}