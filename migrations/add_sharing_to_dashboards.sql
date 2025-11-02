-- Migration: Add sharing functionality to dashboards table
-- Date: 2025-01-XX

ALTER TABLE dashboards 
ADD COLUMN IF NOT EXISTS share_token VARCHAR(64) UNIQUE,
ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT FALSE NOT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_dashboards_share_token ON dashboards(share_token);
CREATE INDEX IF NOT EXISTS idx_dashboards_is_shared ON dashboards(is_shared);

