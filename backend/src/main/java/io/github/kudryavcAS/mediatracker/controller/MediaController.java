package io.github.kudryavcAS.mediatracker.controller;

import io.github.kudryavcAS.mediatracker.dto.MediaItemRequest;
import io.github.kudryavcAS.mediatracker.dto.MediaItemResponse;
import io.github.kudryavcAS.mediatracker.dto.PageResponse;
import io.github.kudryavcAS.mediatracker.dto.WatchDetailResponse;
import io.github.kudryavcAS.mediatracker.model.MediaFormat;
import io.github.kudryavcAS.mediatracker.model.WatchStatus;
import io.github.kudryavcAS.mediatracker.service.MediaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/media")
@RequiredArgsConstructor
@Tag(name = "Media Items", description = "Endpoints for managing movies and series")
public class MediaController {

    private final MediaService mediaService;

    @PostMapping
    public ResponseEntity<MediaItemResponse> createItem(@Valid @RequestBody MediaItemRequest request) {
        log.info("REST request to create media item: {}", request.title());
        MediaItemResponse response = mediaService.createItem(request);
        return ResponseEntity.created(URI.create("/api/v1/media/" + response.id())).body(response);
    }

    @GetMapping
    @Operation(summary = "Get list of media items", description = "Returns a paginated and filtered list of movies and series")
    public PageResponse<MediaItemResponse> getItems(
            @Parameter(description = "Filter by content type (MOVIE or SERIES)") @RequestParam(required = false) String contentType,
            @Parameter(description = "Filter by format") @RequestParam(required = false) MediaFormat format,
            @Parameter(description = "Filter by status") @RequestParam(required = false) WatchStatus status,
            @Parameter(description = "Search in title or directors") @RequestParam(required = false) String query,
            @Parameter(description = "Include archived items in results") @RequestParam(defaultValue = "false") boolean includeArchived,
            @Parameter(description = "Page number (starts from 1)") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "50") int size
    ) {
        log.info("REST request to get filtered media items");
        return PageResponse.from(mediaService.getFilteredItems(contentType, format, status, query, includeArchived, page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get media item by ID", description = "Returns full details of a specific movie or series")
    public MediaItemResponse getItem(
            @Parameter(description = "UUID of the media item") @PathVariable UUID id
    ) {
        log.info("REST request to get media item by ID: {}", id);
        return mediaService.getItemById(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update media item", description = "Updates an existing media item completely")
    public MediaItemResponse updateItem(
            @Parameter(description = "UUID of the media item") @PathVariable UUID id,
            @Valid @RequestBody MediaItemRequest request
    ) {
        log.info("REST request to update media item by ID: {}", id);
        return mediaService.updateItem(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete media item", description = "Permanently deletes the item and all its watch logs. This action cannot be undone.")
    public void deleteItem(
            @Parameter(description = "UUID of the media item") @PathVariable UUID id
    ) {
        log.info("REST request to delete media item by ID: {}", id);
        mediaService.deleteItem(id);
    }

    @PatchMapping("/{id}/progress")
    @Operation(summary = "Update series progress", description = "Increments or decrements watched episodes. Provide positive or negative delta.")
    public MediaItemResponse updateProgress(
            @Parameter(description = "UUID of the media item") @PathVariable UUID id,
            @Parameter(description = "Number of episodes to add/subtract") @RequestParam int delta
    ) {
        log.info("REST request to update progress for media item by ID: {}", id);
        return mediaService.updateSeriesProgress(id, delta);
    }

    @PatchMapping("/{id}/archive")
    @Operation(summary = "Archive media item", description = "Hides the item from the default library view without deleting it or its watch logs")
    public MediaItemResponse archiveItem(
            @Parameter(description = "UUID of the media item") @PathVariable UUID id
    ) {
        log.info("REST request to archive media item by ID: {}", id);
        return mediaService.setArchived(id, true);
    }

    @PatchMapping("/{id}/unarchive")
    @Operation(summary = "Unarchive media item", description = "Restores the item to the default library view")
    public MediaItemResponse unarchiveItem(
            @Parameter(description = "UUID of the media item") @PathVariable UUID id
    ) {
        log.info("REST request to unarchive media item by ID: {}", id);
        return mediaService.setArchived(id, false);
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Mark as completed", description = "Marks item as completed and calculates remaining watch time")
    public MediaItemResponse markAsCompleted(
            @Parameter(description = "UUID of the media item") @PathVariable UUID id
    ) {
        log.info("REST request to mark media item as completed by ID: {}", id);
        return mediaService.markAsCompleted(id);
    }

    @GetMapping("/{id}/logs")
    @Operation(summary = "Get watch logs for item", description = "Returns the history of viewings for a specific media item")
    public List<WatchDetailResponse> getItemWatchLogs(
            @Parameter(description = "UUID of the media item") @PathVariable UUID id
    ) {
        log.info("REST request to get watch logs for media item ID: {}", id);
        return mediaService.getItemWatchLogs(id);
    }
}