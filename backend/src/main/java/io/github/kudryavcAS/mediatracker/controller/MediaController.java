package io.github.kudryavcAS.mediatracker.controller;

import io.github.kudryavcAS.mediatracker.dto.MediaItemRequest;
import io.github.kudryavcAS.mediatracker.dto.MediaItemResponse;
import io.github.kudryavcAS.mediatracker.service.MediaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/media")
@RequiredArgsConstructor
@Tag(name = "Media Items", description = "Endpoints for managing movies and series")
public class MediaController {

    private final MediaService mediaService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new media item", description = "Adds a new movie or series to the database")
    public MediaItemResponse createItem(
            @Valid @RequestBody MediaItemRequest request
    ) {
        log.info("REST request to create media item: {}", request.title());
        return mediaService.createItem(request);
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
    @Operation(summary = "Update media item", description = "Updates existing media item")
    public MediaItemResponse updateItem(
            @PathVariable UUID id,
            @Valid @RequestBody MediaItemRequest request
    ) {
        return mediaService.updateItem(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete media item", description = "Soft deletes a media item by ID")
    public void deleteItem(@PathVariable UUID id) {
        mediaService.deleteItem(id);
    }
}