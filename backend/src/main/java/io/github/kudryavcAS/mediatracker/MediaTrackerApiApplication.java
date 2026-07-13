package io.github.kudryavcAS.mediatracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class MediaTrackerApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(MediaTrackerApiApplication.class, args);
	}

}
