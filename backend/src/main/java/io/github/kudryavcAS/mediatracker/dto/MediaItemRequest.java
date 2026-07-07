package io.github.kudryavcAS.mediatracker.dto;

import io.github.kudryavcAS.mediatracker.model.MediaFormat;
import io.github.kudryavcAS.mediatracker.model.WatchStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// Record пишется в круглых скобках!
public record MediaItemRequest(

        @NotBlank(message = "Тип контента обязателен (MOVIE или SERIES)")
        String contentType,

        @NotBlank(message = "Название не может быть пустым")
        String title,

        @NotNull(message = "Формат обязателен")
        MediaFormat format,

        @Min(value = 1888, message = "Год не может быть раньше 1888")
        @Max(value = 2100, message = "Год не может быть больше 2100")
        Integer releaseYear,

        @Min(value = 1, message = "Продолжительность должна быть больше 0")
        Integer durationMinutes,

        String directors,

        WatchStatus status,

        // Эти поля фронтенд будет присылать только для SERIES
        @Min(value = 1, message = "Количество эпизодов должно быть минимум 1")
        Integer totalEpisodes,

        @Min(value = 0, message = "Просмотренные эпизоды не могут быть отрицательными")
        Integer watchedEpisodes
) {
}