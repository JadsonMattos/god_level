-- Migration 001: Complete Dashboards Schema
-- This migration ensures all dashboard fields and indexes are present
-- It's idempotent - safe to run multiple times
-- Date: 2025-01-XX

-- Add is_default column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dashboards' AND column_name = 'is_default'
    ) THEN
        ALTER TABLE dashboards 
        ADD COLUMN is_default BOOLEAN DEFAULT false NOT NULL;
        
        CREATE INDEX IF NOT EXISTS idx_dashboards_is_default ON dashboards(is_default);
        
        RAISE NOTICE 'Added is_default column to dashboards table';
    ELSE
        RAISE NOTICE 'Column is_default already exists in dashboards table';
    END IF;
END $$;

-- Add sharing columns if they don't exist
DO $$ 
BEGIN
    -- Add share_token if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dashboards' AND column_name = 'share_token'
    ) THEN
        ALTER TABLE dashboards 
        ADD COLUMN share_token VARCHAR(64) UNIQUE;
        
        CREATE INDEX IF NOT EXISTS idx_dashboards_share_token ON dashboards(share_token);
        
        RAISE NOTICE 'Added share_token column to dashboards table';
    ELSE
        RAISE NOTICE 'Column share_token already exists in dashboards table';
    END IF;
    
    -- Add is_shared if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dashboards' AND column_name = 'is_shared'
    ) THEN
        ALTER TABLE dashboards 
        ADD COLUMN is_shared BOOLEAN DEFAULT false NOT NULL;
        
        CREATE INDEX IF NOT EXISTS idx_dashboards_is_shared ON dashboards(is_shared);
        
        RAISE NOTICE 'Added is_shared column to dashboards table';
    ELSE
        RAISE NOTICE 'Column is_shared already exists in dashboards table';
    END IF;
END $$;

-- Ensure all indexes exist (idempotent)
CREATE INDEX IF NOT EXISTS idx_dashboards_name ON dashboards(name);
CREATE INDEX IF NOT EXISTS idx_dashboards_user_id ON dashboards(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_is_default ON dashboards(is_default);
CREATE INDEX IF NOT EXISTS idx_dashboards_share_token ON dashboards(share_token);
CREATE INDEX IF NOT EXISTS idx_dashboards_is_shared ON dashboards(is_shared);

