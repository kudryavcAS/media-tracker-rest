ALTER TABLE watch_log DROP CONSTRAINT watch_log_media_item_id_fkey;

ALTER TABLE watch_log
    ADD CONSTRAINT watch_log_media_item_id_fkey
        FOREIGN KEY (media_item_id) REFERENCES media_item(id) ON DELETE CASCADE;

ALTER TABLE media_item DROP COLUMN is_deleted;