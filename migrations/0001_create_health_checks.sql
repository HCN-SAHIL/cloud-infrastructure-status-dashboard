-- Migration number: 0001 	 2026-11-10T10:53:44.757Z
CREATE TABLE IF NOT EXISTS health_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_name TEXT NOT NULL,
    api_status TEXT NOT NULL,
    database_status TEXT NOT NULL,
    response_time_ms INTEGER,
    error_message TEXT,
    checked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_health_checks_checked_at
ON health_checks(checked_at);
