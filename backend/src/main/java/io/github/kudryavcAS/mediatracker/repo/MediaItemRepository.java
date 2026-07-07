package io.github.kudryavcAS.mediatracker.repo;

import io.github.kudryavcAS.mediatracker.model.MediaItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MediaItemRepository extends JpaRepository<MediaItem, UUID>, JpaSpecificationExecutor<MediaItem> {
}