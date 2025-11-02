-- Migration: Add is_default column to dashboards table
-- Run this SQL in your database

ALTER TABLE dashboards 
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false NOT NULL;

CREATE INDEX IF NOT EXISTS idx_dashboards_is_default ON dashboards(is_default);


