package io.github.kudryavcAS.mediatracker.repo;

import io.github.kudryavcAS.mediatracker.model.MediaItem;
import io.github.kudryavcAS.mediatracker.model.WatchLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface WatchLogRepository extends JpaRepository<WatchLog, UUID> {

    @Query(value = """
            SELECT TO_CHAR(d.date_series, 'YYYY-MM-DD') as watchDate, 
                   COALESCE(SUM(w.minutes_watched), 0) as totalMinutes,
            
                   COALESCE(SUM(CASE WHEN mi.content_type = 'MOVIE' THEN w.minutes_watched ELSE 0 END), 0) as movieMinutes,
                   COALESCE(SUM(CASE WHEN mi.content_type = 'SERIES' THEN w.minutes_watched ELSE 0 END), 0) as seriesMinutes,
            
                   COALESCE(SUM(CASE WHEN mi.format = 'LIVE_ACTION' THEN w.minutes_watched ELSE 0 END), 0) as liveActionMinutes,
                   COALESCE(SUM(CASE WHEN mi.format = 'ANIME' THEN w.minutes_watched ELSE 0 END), 0) as animeMinutes,
                   COALESCE(SUM(CASE WHEN mi.format = 'ANIMATION' THEN w.minutes_watched ELSE 0 END), 0) as animationMinutes
            
            FROM generate_series(CAST(:startDate AS timestamp), CAST(:endDate AS timestamp), interval '1 day') AS d(date_series)
            LEFT JOIN watch_log w ON DATE(w.watched_at) = DATE(d.date_series)
            LEFT JOIN media_item mi ON w.media_item_id = mi.id
            GROUP BY d.date_series ORDER BY d.date_series ASC
            """, nativeQuery = true)
    List<ChartDataProjection> getDailyActivity(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query(value = """
            SELECT TO_CHAR(d.date_series, 'YYYY-MM-DD') as watchDate, 
                   COALESCE(SUM(w.minutes_watched), 0) as totalMinutes,
            
                   COALESCE(SUM(CASE WHEN mi.content_type = 'MOVIE' THEN w.minutes_watched ELSE 0 END), 0) as movieMinutes,
                   COALESCE(SUM(CASE WHEN mi.content_type = 'SERIES' THEN w.minutes_watched ELSE 0 END), 0) as seriesMinutes,
            
                   COALESCE(SUM(CASE WHEN mi.format = 'LIVE_ACTION' THEN w.minutes_watched ELSE 0 END), 0) as liveActionMinutes,
                   COALESCE(SUM(CASE WHEN mi.format = 'ANIME' THEN w.minutes_watched ELSE 0 END), 0) as animeMinutes,
                   COALESCE(SUM(CASE WHEN mi.format = 'ANIMATION' THEN w.minutes_watched ELSE 0 END), 0) as animationMinutes
            
            FROM generate_series(date_trunc('week', CAST(:startDate AS timestamp)), date_trunc('week', CAST(:endDate AS timestamp)), interval '1 week') AS d(date_series)
            LEFT JOIN watch_log w ON date_trunc('week', w.watched_at) = d.date_series
            LEFT JOIN media_item mi ON w.media_item_id = mi.id
            GROUP BY d.date_series ORDER BY d.date_series ASC
            """, nativeQuery = true)
    List<ChartDataProjection> getWeeklyActivity(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query(value = """
            SELECT TO_CHAR(d.date_series, 'YYYY-MM') as watchDate, 
                   COALESCE(SUM(w.minutes_watched), 0) as totalMinutes,
            
                   COALESCE(SUM(CASE WHEN mi.content_type = 'MOVIE' THEN w.minutes_watched ELSE 0 END), 0) as movieMinutes,
                   COALESCE(SUM(CASE WHEN mi.content_type = 'SERIES' THEN w.minutes_watched ELSE 0 END), 0) as seriesMinutes,
            
                   COALESCE(SUM(CASE WHEN mi.format = 'LIVE_ACTION' THEN w.minutes_watched ELSE 0 END), 0) as liveActionMinutes,
                   COALESCE(SUM(CASE WHEN mi.format = 'ANIME' THEN w.minutes_watched ELSE 0 END), 0) as animeMinutes,
                   COALESCE(SUM(CASE WHEN mi.format = 'ANIMATION' THEN w.minutes_watched ELSE 0 END), 0) as animationMinutes
            
            FROM generate_series(date_trunc('month', CAST(:startDate AS timestamp)), date_trunc('month', CAST(:endDate AS timestamp)), interval '1 month') AS d(date_series)
            LEFT JOIN watch_log w ON date_trunc('month', w.watched_at) = d.date_series
            LEFT JOIN media_item mi ON w.media_item_id = mi.id
            GROUP BY d.date_series ORDER BY d.date_series ASC
            """, nativeQuery = true)
    List<ChartDataProjection> getMonthlyActivity(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query(value = """
            SELECT w.* 
            FROM watch_log w
            WHERE 
                (:grouping = 'DAY' AND TO_CHAR(w.watched_at, 'YYYY-MM-DD') = :dateKey) OR
                (:grouping = 'WEEK' AND TO_CHAR(date_trunc('week', w.watched_at), 'YYYY-MM-DD') = :dateKey) OR
                (:grouping = 'MONTH' AND TO_CHAR(w.watched_at, 'YYYY-MM') = :dateKey)
            ORDER BY w.watched_at DESC
            """, nativeQuery = true)
    List<WatchLog> findLogsByDateKey(@Param("dateKey") String dateKey, @Param("grouping") String grouping);

    List<WatchLog> findByMediaItemOrderByWatchedAtDesc(MediaItem mediaItem);
}