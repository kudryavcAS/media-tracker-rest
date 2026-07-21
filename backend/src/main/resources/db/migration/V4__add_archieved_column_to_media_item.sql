ALTER TABLE media_item ADD COLUMN archived BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX idx_media_item_archived ON media_item(archived);