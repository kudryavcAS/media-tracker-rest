package io.github.kudryavcAS.mediatracker.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.kudryavcAS.mediatracker.dto.BackupDataDto;
import io.github.kudryavcAS.mediatracker.model.*;
import io.github.kudryavcAS.mediatracker.repo.MediaItemRepository;
import io.github.kudryavcAS.mediatracker.repo.WatchLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BackupService {

    private final MediaItemRepository mediaRepository;
    private final WatchLogRepository watchLogRepository;
    private final ObjectMapper objectMapper;
    private final JdbcTemplate jdbcTemplate;

    @Transactional(readOnly = true)
    public byte[] exportData() {
        log.info("Starting database export to JSON...");

        List<BackupDataDto.MediaItemBackupDto> itemDtos = mediaRepository.findAllIncludingDeleted().stream()
                .map(p -> new BackupDataDto.MediaItemBackupDto(
                        p.getId(),
                        p.getContentType(),
                        p.getTitle(),
                        MediaFormat.valueOf(p.getFormat()),
                        p.getReleaseYear(),
                        p.getDurationMinutes(),
                        p.getDirectors(),
                        WatchStatus.valueOf(p.getStatus()),
                        p.getTotalEpisodes(),
                        p.getWatchedEpisodes(),
                        p.getCreatedAt(),
                        Boolean.FALSE
                ))
                .toList();

        List<BackupDataDto.WatchLogBackupDto> logDtos = watchLogRepository.findAll().stream()
                .map(l -> new BackupDataDto.WatchLogBackupDto(
                        l.getId(),
                        l.getMediaItem().getId(),
                        l.getWatchedAt(),
                        l.getMinutesWatched(),
                        l.getEpisodes()
                ))
                .toList();

        try {
            return objectMapper.writeValueAsBytes(new BackupDataDto(itemDtos, logDtos));
        } catch (IOException e) {
            log.error("Failed to serialize backup data", e);
            throw new RuntimeException("Failed to export backup data", e);
        }
    }

    @Transactional
    public void importData(MultipartFile file, boolean overwrite) {
        log.info("Starting database import. Overwrite mode: {}", overwrite);

        BackupDataDto backup;
        try {
            backup = objectMapper.readValue(file.getInputStream(), BackupDataDto.class);
        } catch (IOException e) {
            log.error("Failed to parse backup file", e);
            throw new IllegalArgumentException("Invalid backup file format", e);
        }

        if (overwrite) {
            log.warn("Truncating all tables for full restore...");
            jdbcTemplate.execute("TRUNCATE TABLE watch_log, media_item CASCADE");
        }

        List<MediaItem> itemsToSave = backup.mediaItems().stream()
                .map(dto -> {
                    MediaItem item;
                    if ("MOVIE".equals(dto.contentType())) {
                        item = new Movie();
                    } else {
                        Series series = new Series();
                        series.setTotalEpisodes(dto.totalEpisodes());
                        series.setWatchedEpisodes(dto.watchedEpisodes() != null ? dto.watchedEpisodes() : 0);
                        item = series;
                    }
                    item.setId(dto.id());
                    item.setTitle(dto.title());
                    item.setFormat(dto.format());
                    item.setReleaseYear(dto.releaseYear());
                    item.setDurationMinutes(dto.durationMinutes());
                    item.setDirectors(dto.directors());
                    item.setStatus(dto.status());
                    item.setCreatedAt(dto.createdAt());
                    return item;
                })
                .toList();

        mediaRepository.saveAll(itemsToSave);
        mediaRepository.flush();

        List<WatchLog> logsToSave = backup.watchLogs().stream()
                .map(dto -> {
                    WatchLog watchLog = new WatchLog();
                    watchLog.setId(dto.id());
                    watchLog.setWatchedAt(dto.watchedAt());
                    watchLog.setMinutesWatched(dto.minutesWatched());
                    watchLog.setEpisodes(dto.episodes());
                    watchLog.setMediaItem(mediaRepository.getReferenceById(dto.mediaItemId()));
                    return watchLog;
                })
                .toList();

        watchLogRepository.saveAll(logsToSave);

        List<UUID> toSoftDelete = backup.mediaItems().stream()
                .filter(BackupDataDto.MediaItemBackupDto::isDeleted)
                .map(BackupDataDto.MediaItemBackupDto::id)
                .toList();

        if (!toSoftDelete.isEmpty()) {
            watchLogRepository.flush();
            toSoftDelete.forEach(mediaRepository::deleteById);
        }

        log.info("Successfully imported {} items ({} soft-deleted) and {} logs.",
                itemsToSave.size(), toSoftDelete.size(), logsToSave.size());
    }
}