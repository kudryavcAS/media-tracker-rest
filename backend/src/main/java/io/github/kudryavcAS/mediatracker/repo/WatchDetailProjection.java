package io.github.kudryavcAS.mediatracker.repo;

import java.time.LocalDateTime;
import java.util.UUID;

public interface WatchDetailProjection {
    UUID getLogId();
    UUID getMediaItemId();
    String getTitle();
    String getContentType();
    String getFormat();
    Integer getMinutesWatched();
    Integer getEpisodes();
    LocalDateTime getWatchedAt();
}