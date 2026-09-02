package io.github.kudryavcAS.mediatracker.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin")
@Tag(name = "Admin", description = "Local application lifecycle control")
public class AdminController {

    private final ApplicationContext applicationContext;

    public AdminController(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @PostMapping("/shutdown")
    @Operation(summary = "Shut down the application", description = "Gracefully stops the backend process. Intended for local single-user use only.")
    public void shutdown() {
        log.info("Shutdown requested via API");
        new Thread(() -> {
            try {
                Thread.sleep(300);
            } catch (InterruptedException ignored) {
            }
            SpringApplication.exit(applicationContext, () -> 0);
            System.exit(0);
        }).start();
    }
}