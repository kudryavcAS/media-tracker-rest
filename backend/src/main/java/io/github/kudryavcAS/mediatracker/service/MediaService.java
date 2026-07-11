package io.github.kudryavcAS.mediatracker.service;

import io.github.kudryavcAS.mediatracker.dto.MediaItemRequest;
import io.github.kudryavcAS.mediatracker.dto.MediaItemResponse;
import io.github.kudryavcAS.mediatracker.model.*;
import io.github.kudryavcAS.mediatracker.repo.MediaItemRepository;
import io.github.kudryavcAS.mediatracker.repo.WatchLogRepository;
import io.github.kudryavcAS.mediatracker.repo.spec.MediaItemSpecifications;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaService {

    private final MediaItemRepository mediaRepository;
    private final WatchLogRepository watchLogRepository;

    @Transactional
    public MediaItemResponse createItem(MediaItemRequest request) {
        log.info("Creating new media item: {}", request.title());

        MediaItem entity = mapToEntity(request);
        MediaItem savedEntity = mediaRepository.save(entity);

        log.debug("Successfully created item with ID: {}", savedEntity.getId());
        return mapToResponse(savedEntity);
    }

    @Transactional(readOnly = true)
    public MediaItemResponse getItemById(UUID id) {
        log.debug("Fetching media item with ID: {}", id);

        MediaItem item = mediaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Media item not found with ID: " + id));

        return mapToResponse(item);
    }

    @Transactional(readOnly = true)
    public Page<MediaItemResponse> getFilteredItems(MediaFormat format, WatchStatus status, String query, int page, int size) {
        log.debug("Fetching items with filters - format: {}, status: {}, query: '{}', page: {}", format, status, query, page);

        Specification<MediaItem> spec = MediaItemSpecifications.withFilters(format, status, query);
        Pageable pageable = PageRequest.of(Math.max(0, page - 1), size);

        return mediaRepository.findAll(spec, pageable).map(MediaService::mapToResponse);
    }

    @Transactional
    public MediaItemResponse updateItem(UUID id, MediaItemRequest request) {
        log.info("Updating media item with ID: {}", id);

        MediaItem entity = mediaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Media item not found with ID: " + id));

        entity.setTitle(request.title());
        entity.setFormat(request.format());
        entity.setReleaseYear(request.releaseYear());
        entity.setDurationMinutes(request.durationMinutes());
        entity.setDirectors(request.directors());
        entity.setStatus(request.status());

        if (entity instanceof Series series && request.totalEpisodes() != null) {
            series.setTotalEpisodes(request.totalEpisodes());
            series.setWatchedEpisodes(request.watchedEpisodes() != null ? request.watchedEpisodes() : 0);
        }

        return mapToResponse(mediaRepository.save(entity));
    }

    @Transactional
    public void deleteItem(UUID id) {
        log.info("Deleting media item with ID: {}", id);
        if (!mediaRepository.existsById(id)) {
            throw new EntityNotFoundException("Media item not found with ID: " + id);
        }
        mediaRepository.deleteById(id);
    }

    @Transactional
    public MediaItemResponse updateSeriesProgress(UUID id, int delta) {
        log.info("Updating progress for media item ID: {}, delta: {}", id, delta);

        MediaItem entity = mediaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Media item not found with ID: " + id));

        if (!(entity instanceof Series series)) {
            throw new IllegalArgumentException("Cannot update episode progress for a MOVIE");
        }

        int currentWatched = series.getWatchedEpisodes() != null ? series.getWatchedEpisodes() : 0;
        int total = series.getTotalEpisodes() != null ? series.getTotalEpisodes() : 0;

        int newWatched = Math.max(0, currentWatched + delta);
        if (total > 0 && newWatched > total) {
            newWatched = total;
        }

        int actualDelta = newWatched - currentWatched;

        if (actualDelta > 0) {
            logWatchEvent(series, actualDelta);
        }

        series.setWatchedEpisodes(newWatched);
        syncSeriesStatus(series, newWatched, total);

        return mapToResponse(mediaRepository.save(series));
    }

    @Transactional
    public MediaItemResponse markAsCompleted(UUID id) {
        log.info("Marking media item as completed, ID: {}", id);

        MediaItem entity = mediaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Media item not found with ID: " + id));

        if (entity.getStatus() != WatchStatus.COMPLETED) {
            if (entity instanceof Movie) {
                logWatchEvent(entity, 1);
            } else if (entity instanceof Series series) {
                int current = series.getWatchedEpisodes() != null ? series.getWatchedEpisodes() : 0;
                int total = series.getTotalEpisodes() != null && series.getTotalEpisodes() > 0 ? series.getTotalEpisodes() : 1;

                if (current < total) {
                    logWatchEvent(series, total - current);
                    series.setWatchedEpisodes(total);
                }
            }
            entity.setStatus(WatchStatus.COMPLETED);
            entity = mediaRepository.save(entity);
        }

        return mapToResponse(entity);
    }

    private static void syncSeriesStatus(Series series, int watched, int total) {
        if (total > 0 && watched >= total) {
            series.setStatus(WatchStatus.COMPLETED);
        } else if (watched > 0 && series.getStatus() == WatchStatus.PLANNED) {
            series.setStatus(WatchStatus.WATCHING);
        } else if (watched == 0 && series.getStatus() == WatchStatus.WATCHING) {
            series.setStatus(WatchStatus.PLANNED);
        } else if (series.getStatus() == WatchStatus.COMPLETED && watched < total) {
            series.setStatus(WatchStatus.WATCHING);
        }
    }

    private void logWatchEvent(MediaItem item, int deltaEpisodes) {
        if (deltaEpisodes <= 0) return;

        int minutes = getMinutes(item, deltaEpisodes);

        if (minutes > 0) {
            WatchLog watchLog = new WatchLog();
            watchLog.setMediaItem(item);
            watchLog.setTitleSnapshot(item.getTitle());
            watchLog.setFormatSnapshot(item.getFormat());
            watchLog.setWatchedAt(LocalDateTime.now());
            watchLog.setMinutesWatched(minutes);
            watchLog.setEpisodes(item instanceof Movie ? null : deltaEpisodes);

            watchLogRepository.save(watchLog);
            log.info("Logged watch event: {} mins for '{}'", minutes, item.getTitle());
        }
    }

    private static int getMinutes(MediaItem item, int deltaEpisodes) {
        int minutes = 0;

        if (item instanceof Movie) {
            minutes = item.getDurationMinutes() != null ? item.getDurationMinutes() : 0;
        } else if (item instanceof Series series) {
            int totalDur = series.getDurationMinutes() != null ? series.getDurationMinutes() : 0;
            int totalEps = series.getTotalEpisodes() != null && series.getTotalEpisodes() > 0 ? series.getTotalEpisodes() : 1;
            minutes = Math.round((float) totalDur / totalEps * deltaEpisodes);
        }
        return minutes;
    }

    private static MediaItem mapToEntity(MediaItemRequest request) {
        MediaItem item = createEntityByType(request);

        item.setTitle(request.title());
        item.setFormat(request.format());
        item.setReleaseYear(request.releaseYear());
        item.setDurationMinutes(request.durationMinutes());
        item.setDirectors(request.directors());
        item.setStatus(request.status() != null ? request.status() : WatchStatus.PLANNED);

        return item;
    }

    private static @NonNull MediaItem createEntityByType(MediaItemRequest request) {
        MediaItem item;

        if ("MOVIE".equalsIgnoreCase(request.contentType())) {
            item = new Movie();
        } else if ("SERIES".equalsIgnoreCase(request.contentType())) {
            Series series = new Series();
            series.setTotalEpisodes(request.totalEpisodes());
            series.setWatchedEpisodes(request.watchedEpisodes() != null ? request.watchedEpisodes() : 0);
            item = series;
        } else {
            throw new IllegalArgumentException("Unknown content type: " + request.contentType());
        }
        return item;
    }

    private static MediaItemResponse mapToResponse(MediaItem item) {
        Integer totalEps = null;
        Integer watchedEps = null;
        String contentType = "UNKNOWN";

        if (item instanceof Series series) {
            contentType = "SERIES";
            totalEps = series.getTotalEpisodes();
            watchedEps = series.getWatchedEpisodes();
        } else if (item instanceof Movie) {
            contentType = "MOVIE";
        }

        return new MediaItemResponse(
                item.getId(),
                contentType,
                item.getTitle(),
                item.getFormat(),
                item.getReleaseYear(),
                item.getDurationMinutes(),
                item.getDirectors(),
                item.getStatus(),
                totalEps,
                watchedEps
        );
    }
}