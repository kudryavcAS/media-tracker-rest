package io.github.kudryavcAS.mediatracker.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@DiscriminatorValue("SERIES")
public class Series extends MediaItem {

    private Integer totalEpisodes;

    private Integer watchedEpisodes = 0;
}