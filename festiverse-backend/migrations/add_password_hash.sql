-- Run this file in your Supabase SQL Editor
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;
