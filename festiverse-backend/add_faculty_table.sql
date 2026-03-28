-- Faculty Table for UDAAN Arts Club
-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL)

CREATE TABLE IF NOT EXISTS faculty (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
