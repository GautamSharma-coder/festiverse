-- ═══════════════════════════════════════════════════════════
-- Analytics Migration: Track Unique Visitors
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_hash TEXT NOT NULL,
  user_agent TEXT,
  visited_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster counts
CREATE INDEX IF NOT EXISTS idx_visitors_ip_hash ON visitors(ip_hash);
CREATE INDEX IF NOT EXISTS idx_visitors_visited_at ON visitors(visited_at);
