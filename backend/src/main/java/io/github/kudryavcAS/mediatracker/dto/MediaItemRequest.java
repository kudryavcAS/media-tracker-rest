package io.github.kudryavcAS.mediatracker.dto;

import io.github.kudryavcAS.mediatracker.model.MediaFormat;
import io.github.kudryavcAS.mediatracker.model.WatchStatus;
import io.github.kudryavcAS.mediatracker.util.ValidationConstants;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MediaItemRequest(

        @NotBlank(message = "Content type is required (MOVIE or SERIES)")
        String contentType,

        @NotBlank(message = "Title cannot be empty")
        String title,

        @NotNull(message = "Format is required")
        MediaFormat format,

        @Min(value = ValidationConstants.MIN_RELEASE_YEAR,
                message = "Release year cannot be earlier than " + ValidationConstants.MIN_RELEASE_YEAR)
        @Max(value = ValidationConstants.MAX_RELEASE_YEAR,
                message = "Release year cannot be later than " + ValidationConstants.MAX_RELEASE_YEAR)
        Integer releaseYear,

        @Min(value = ValidationConstants.MIN_DURATION_MINUTES,
                message = "Duration must be greater than " + ValidationConstants.MIN_DURATION_MINUTES)
        Integer durationMinutes,

        String directors,

        WatchStatus status,

        @Min(value = ValidationConstants.MIN_EPISODES,
                message = "Total episodes must be at least " + ValidationConstants.MIN_EPISODES)
        Integer totalEpisodes,

        @Min(value = ValidationConstants.MIN_WATCHED_EPISODES,
                message = "Watched episodes cannot be less than " + ValidationConstants.MIN_WATCHED_EPISODES)
        Integer watchedEpisodes
) {
}