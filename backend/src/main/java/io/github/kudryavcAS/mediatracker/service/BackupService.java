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

        List<BackupDataDto.MediaItemBackupDto> itemDtos = mediaRepository.findAll().stream()
                .map(item -> new BackupDataDto.MediaItemBackupDto(
                        item.getId(),
                        item.getContentType(),
                        item.getTitle(),
                        item.getFormat(),
                        item.getReleaseYear(),
                        item.getDurationMinutes(),
                        item.getDirectors(),
                        item.getStatus(),
                        item instanceof Series s ? s.getTotalEpisodes() : null,
                        item instanceof Series s ? s.getWatchedEpisodes() : null,
                        item.getCreatedAt(),
                        item.isArchived()
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
    public void importData(org.springframework.web.multipart.MultipartFile file, boolean overwrite) {
        log.info("Starting database import. Overwrite mode: {}", overwrite);

        io.github.kudryavcAS.mediatracker.dto.BackupDataDto backup;
        try {
            backup = objectMapper.readValue(file.getInputStream(), io.github.kudryavcAS.mediatracker.dto.BackupDataDto.class);
        } catch (java.io.IOException e) {
            log.error("Failed to parse backup file", e);
            throw new IllegalArgumentException("Invalid backup file format", e);
        }

        if (overwrite) {
            log.warn("Truncating all tables for full restore...");
            jdbcTemplate.execute("TRUNCATE TABLE watch_log, media_item CASCADE");
        }

        log.info("Inserting media items via native SQL batch...");
        jdbcTemplate.batchUpdate(
                """
                        INSERT INTO media_item 
                            (id, 
                             content_type, 
                             title, 
                             format, 
                             release_year, 
                             duration_minutes, 
                             directors, 
                             status, 
                             total_episodes, 
                             watched_episodes, 
                             created_at, 
                             archived)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                backup.mediaItems(),
                100,
                (ps, dto) -> {
                    ps.setObject(1, dto.id());
                    ps.setString(2, dto.contentType());
                    ps.setString(3, dto.title());
                    ps.setString(4, dto.format().name());
                    ps.setObject(5, dto.releaseYear());
                    ps.setObject(6, dto.durationMinutes());
                    ps.setString(7, dto.directors());
                    ps.setString(8, dto.status().name());
                    ps.setObject(9, dto.totalEpisodes());
                    ps.setObject(10, dto.watchedEpisodes());
                    ps.setObject(11, dto.createdAt());
                    ps.setBoolean(12, dto.archived());
                }
        );

        log.info("Inserting watch logs via native SQL batch...");
        jdbcTemplate.batchUpdate(
                "INSERT INTO watch_log (id, media_item_id, watched_at, minutes_watched, episodes) VALUES (?, ?, ?, ?, ?)",
                backup.watchLogs(),
                100,
                (ps, dto) -> {
                    ps.setObject(1, dto.id());
                    ps.setObject(2, dto.mediaItemId());
                    ps.setObject(3, dto.watchedAt());
                    ps.setObject(4, dto.minutesWatched());
                    ps.setObject(5, dto.episodes());
                }
        );

        log.info("Successfully imported {} items and {} logs.", backup.mediaItems().size(), backup.watchLogs().size());
    }
}