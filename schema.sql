CREATE TABLE IF NOT EXISTS scope_items (
  id VARCHAR(255) PRIMARY KEY,
  priority VARCHAR(10) NOT NULL,
  title TEXT NOT NULL,
  category VARCHAR(255),
  sow_ref VARCHAR(255),
  sst_status JSONB,
  our_position JSONB,
  decision VARCHAR(50),
  phase VARCHAR(50),
  timeline VARCHAR(100),
  dependencies TEXT,
  activity JSONB[],
  signed_off BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);