CREATE TABLE media_item
(
    id               UUID PRIMARY KEY,
    content_type     VARCHAR(30)  NOT NULL,
    title            VARCHAR(255) NOT NULL,
    format           VARCHAR(30)  NOT NULL,
    release_year     INT,
    duration_minutes INT,
    directors        VARCHAR(1000),
    status           VARCHAR(30)  NOT NULL DEFAULT 'PLANNED',

    total_episodes   INT,
    watched_episodes INT                   DEFAULT 0,

    is_deleted       BOOLEAN      NOT NULL DEFAULT FALSE
);

CREATE TABLE watch_log
(
    id              UUID PRIMARY KEY,
    media_item_id   UUID         NOT NULL REFERENCES media_item (id),
    title_snapshot  VARCHAR(255) NOT NULL,
    format_snapshot VARCHAR(30)  NOT NULL,
    watched_at      TIMESTAMP    NOT NULL,
    minutes_watched INT          NOT NULL,
    episodes        INT
);

CREATE INDEX idx_media_item_is_deleted ON media_item (is_deleted);
CREATE INDEX idx_watch_log_media_item_id ON watch_log (media_item_id);
CREATE INDEX idx_watch_log_watched_at ON watch_log (watched_at);