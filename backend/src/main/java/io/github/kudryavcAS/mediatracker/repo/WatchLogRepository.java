package io.github.kudryavcAS.mediatracker.repo;

import io.github.kudryavcAS.mediatracker.model.WatchLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface WatchLogRepository extends JpaRepository<WatchLog, UUID> {
}