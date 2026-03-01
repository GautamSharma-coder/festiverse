-- ═══════════════════════════════════════════════════════════
-- Festiverse Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL)
-- ═══════════════════════════════════════════════════════════

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  college TEXT,
  email TEXT,
  phone TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  date DATE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. EVENT REGISTRATIONS (many-to-many: users ↔ events)
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- 4. MESSAGES (contact form)
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. GALLERY
CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT,
  url TEXT NOT NULL,
  title TEXT,
  category TEXT DEFAULT 'general',
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- 6. TEAM MEMBERS
CREATE TABLE IF NOT EXISTS team (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  social_link TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- SEED DATA: Sample Events
-- ═══════════════════════════════════════════════════════════
INSERT INTO events (name, location, date) VALUES
  ('Solo Dance', 'Main Stage', '2026-10-21'),
  ('Battle of Bands', 'OAT', '2026-10-22'),
  ('Face Painting', 'Art Gallery', '2026-10-21'),
  ('Debate', 'Seminar Hall', '2026-10-20'),
  ('Solo Singing', 'Auditorium', '2026-10-22'),
  ('Wall Painting', 'Campus Walls', '2026-10-20');

-- ═══════════════════════════════════════════════════════════
-- IMPORTANT: Create a Supabase Storage bucket called "assets"
-- Go to Dashboard → Storage → New Bucket → Name: "assets"
-- Set it to PUBLIC so the URLs are accessible from the frontend.
-- ═══════════════════════════════════════════════════════════
