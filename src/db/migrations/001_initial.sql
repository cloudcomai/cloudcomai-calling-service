CREATE TABLE IF NOT EXISTS calls (
 id CHAR(36) NOT NULL PRIMARY KEY,
 caller_user_id VARCHAR(128) NOT NULL,
 callee_user_id VARCHAR(128) NOT NULL,
 call_type ENUM('audio','video') NOT NULL,
 state ENUM('ringing','connecting','connected','ended','rejected','cancelled','no_answer','failed') NOT NULL,
 end_reason VARCHAR(32) NULL,
 created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 accepted_at TIMESTAMP(3) NULL,
 connected_at TIMESTAMP(3) NULL,
 ended_at TIMESTAMP(3) NULL,
 KEY idx_calls_caller_created (caller_user_id,created_at),
 KEY idx_calls_callee_created (callee_user_id,created_at),
 KEY idx_calls_state_created (state,created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE IF NOT EXISTS call_participants (
 call_id CHAR(36) NOT NULL,
 user_id VARCHAR(128) NOT NULL,
 role ENUM('caller','callee') NOT NULL,
 last_seen_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 PRIMARY KEY(call_id,user_id),
 KEY idx_call_participants_user(user_id),
 CONSTRAINT fk_call_participants_call FOREIGN KEY(call_id) REFERENCES calls(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE IF NOT EXISTS call_events (
 event_id CHAR(36) NOT NULL PRIMARY KEY,
 call_id CHAR(36) NOT NULL,
 actor_user_id VARCHAR(128) NULL,
 event_type VARCHAR(64) NOT NULL,
 payload JSON NULL,
 created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 KEY idx_call_events_call_created(call_id,created_at),
 CONSTRAINT fk_call_events_call FOREIGN KEY(call_id) REFERENCES calls(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
