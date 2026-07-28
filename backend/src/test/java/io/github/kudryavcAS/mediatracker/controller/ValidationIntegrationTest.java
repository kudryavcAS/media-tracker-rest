package io.github.kudryavcAS.mediatracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.kudryavcAS.mediatracker.AbstractIntegrationTest;
import io.github.kudryavcAS.mediatracker.dto.MediaItemRequest;
import io.github.kudryavcAS.mediatracker.model.MediaFormat;
import io.github.kudryavcAS.mediatracker.model.WatchStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class ValidationIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void pageSizeAboveMaxIsRejectedWith400() throws Exception {
        mockMvc.perform(get("/api/v1/media").param("size", "500"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void pageSizeZeroIsRejectedWith400() throws Exception {
        mockMvc.perform(get("/api/v1/media").param("size", "0"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void pageSizeWithinLimitIsAccepted() throws Exception {
        mockMvc.perform(get("/api/v1/media").param("size", "200"))
                .andExpect(status().isOk());
    }

    @Test
    void markingCompletedWithFutureWatchedAtIsRejectedWith400() throws Exception {
        MediaItemRequest createRequest = new MediaItemRequest(
                "MOVIE", "Interstellar", MediaFormat.LIVE_ACTION,
                2014, 169, "Christopher Nolan", WatchStatus.PLANNED, null, null
        );

        String createResponseJson = mockMvc.perform(post("/api/v1/media")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String createdId = objectMapper.readTree(createResponseJson).get("id").asText();

        String futureDate = LocalDateTime.now().plusDays(1).toString();

        mockMvc.perform(post("/api/v1/media/{id}/complete", createdId)
                        .param("watchedAt", futureDate))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }
}