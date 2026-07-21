package io.github.kudryavcAS.mediatracker.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "watch_log")
public class WatchLog {

    @Id
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "media_item_id", nullable = false)
    private MediaItem mediaItem;

    @Column(nullable = false)
    private LocalDateTime watchedAt;

    @Column(nullable = false)
    private Integer minutesWatched;

    private Integer episodes;
}