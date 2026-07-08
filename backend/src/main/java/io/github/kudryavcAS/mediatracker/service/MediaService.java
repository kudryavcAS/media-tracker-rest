package io.github.kudryavcAS.mediatracker.service;

import io.github.kudryavcAS.mediatracker.dto.MediaItemRequest;
import io.github.kudryavcAS.mediatracker.dto.MediaItemResponse;
import io.github.kudryavcAS.mediatracker.model.MediaItem;
import io.github.kudryavcAS.mediatracker.model.Movie;
import io.github.kudryavcAS.mediatracker.model.Series;
import io.github.kudryavcAS.mediatracker.model.WatchStatus;
import io.github.kudryavcAS.mediatracker.repo.MediaItemRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaService {

    private final MediaItemRepository mediaRepository;

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

    private MediaItem mapToEntity(MediaItemRequest request) {
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

    private MediaItemResponse mapToResponse(MediaItem item) {
        Integer totalEps = null;
        Integer watchedEps = null;

        if (item instanceof Series series) {
            totalEps = series.getTotalEpisodes();
            watchedEps = series.getWatchedEpisodes();
        }

        return new MediaItemResponse(
                item.getId(),
                item.getContentType(),
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