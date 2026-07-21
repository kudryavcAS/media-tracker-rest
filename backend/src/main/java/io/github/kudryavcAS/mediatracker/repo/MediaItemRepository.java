package io.github.kudryavcAS.mediatracker.repo;

import io.github.kudryavcAS.mediatracker.model.MediaItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MediaItemRepository extends JpaRepository<MediaItem, UUID>, JpaSpecificationExecutor<MediaItem> {

    @org.springframework.data.jpa.repository.Query(value = """
            SELECT 
                COUNT(id) as totalItems,
                COUNT(id) FILTER (WHERE content_type = 'MOVIE') as movieCount,
                COUNT(id) FILTER (WHERE content_type = 'SERIES') as seriesCount,
                COUNT(id) FILTER (WHERE status = 'COMPLETED') as completedCount,
                COUNT(id) FILTER (WHERE status = 'WATCHING') as watchingCount,
                COUNT(id) FILTER (WHERE status = 'PLANNED') as plannedCount,
                COUNT(id) FILTER (WHERE status = 'DROPPED') as droppedCount,
                COALESCE(SUM(duration_minutes), 0) as totalDuration,
            
                COALESCE(SUM(
                    CASE 
                        WHEN status = 'COMPLETED' THEN COALESCE(duration_minutes, 0)
                        WHEN content_type = 'SERIES' AND total_episodes > 0 THEN (COALESCE(duration_minutes, 0) * COALESCE(watched_episodes, 0)) / total_episodes
                        ELSE 0
                    END
                ), 0) as watchedDuration,
            
                COALESCE(SUM(CASE WHEN format = 'LIVE_ACTION' THEN 
                    CASE WHEN status = 'COMPLETED' THEN COALESCE(duration_minutes, 0) 
                         WHEN content_type = 'SERIES' AND total_episodes > 0 THEN (COALESCE(duration_minutes, 0) * COALESCE(watched_episodes, 0)) / total_episodes 
                         ELSE 0 END 
                    ELSE 0 END), 0) as liveActionWatched,
            
                COALESCE(SUM(CASE WHEN format = 'ANIME' THEN 
                    CASE WHEN status = 'COMPLETED' THEN COALESCE(duration_minutes, 0) 
                         WHEN content_type = 'SERIES' AND total_episodes > 0 THEN (COALESCE(duration_minutes, 0) * COALESCE(watched_episodes, 0)) / total_episodes 
                         ELSE 0 END 
                    ELSE 0 END), 0) as animeWatched,
            
                COALESCE(SUM(CASE WHEN format = 'ANIMATION' THEN 
                    CASE WHEN status = 'COMPLETED' THEN COALESCE(duration_minutes, 0) 
                         WHEN content_type = 'SERIES' AND total_episodes > 0 THEN (COALESCE(duration_minutes, 0) * COALESCE(watched_episodes, 0)) / total_episodes 
                         ELSE 0 END 
                    ELSE 0 END), 0) as animationWatched
            FROM media_item
            WHERE archived = false
            """, nativeQuery = true)
    StatsProjection getOverallStatistics();

    @org.springframework.data.jpa.repository.Query(value = """
            SELECT id, content_type as contentType, title, format, release_year as releaseYear,
                   duration_minutes as durationMinutes, directors, status,
                   total_episodes as totalEpisodes, watched_episodes as watchedEpisodes,
                   created_at as createdAt
            FROM media_item
            """, nativeQuery = true)
    List<MediaItemBackupProjection> findAllIncludingDeleted();
}