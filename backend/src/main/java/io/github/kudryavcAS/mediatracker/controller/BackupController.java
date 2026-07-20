package io.github.kudryavcAS.mediatracker.controller;

import io.github.kudryavcAS.mediatracker.service.BackupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@RestController
@RequestMapping("/api/v1/backup")
@RequiredArgsConstructor
@Tag(name = "Backup", description = "Import and export database as JSON")
public class BackupController {

    private final BackupService backupService;

    @GetMapping("/export")
    @Operation(summary = "Export database", description = "Downloads the entire database as a JSON file")
    public ResponseEntity<byte[]> exportData() {
        log.info("REST request to export database");
        byte[] data = backupService.exportData();

        String filename = "media_backup_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss")) + ".json";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_JSON)
                .body(data);
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Import database", description = "Uploads a JSON file to restore the database")
    public ResponseEntity<Void> importData(
            @Parameter(description = "JSON backup file") @RequestParam("file") MultipartFile file,
            @Parameter(description = "Overwrite existing database?") @RequestParam(defaultValue = "false") boolean overwrite
    ) {
        log.info("REST request to import database");
        backupService.importData(file, overwrite);
        return ResponseEntity.ok().build();
    }
}