-- Create tables for FloHub with multi-calendar integration

-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS calendar_sources CASCADE;

-- Users table (for Replit Auth)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Sessions table for Replit Auth
CREATE TABLE IF NOT EXISTS sessions (
  sid TEXT PRIMARY KEY,
  sess TEXT NOT NULL,
  expire TIMESTAMP WITH TIME ZONE NOT NULL
);

-- User settings with calendar preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  selected_cals TEXT[] DEFAULT '{}',
  default_view TEXT DEFAULT 'month',
  last_sync_time TIMESTAMP WITH TIME ZONE,
  global_tags TEXT[] DEFAULT '{}',
  active_widgets TEXT[] DEFAULT '{tasks,calendar,ataglance,quicknote}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Calendar sources for multi-calendar integration
CREATE TABLE IF NOT EXISTS calendar_sources (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'google', 'o365', 'other'
  source_id TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE NOT NULL,
  tags TEXT[] DEFAULT '{}',
  connection_data TEXT NOT NULL, -- JSON string with connection details
  last_sync_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Registrations
CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  has_gmail BOOLEAN NOT NULL DEFAULT FALSE,
  gmail_account TEXT,
  devices TEXT[],
  role TEXT NOT NULL,
  why TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Updates for registered users
CREATE TABLE IF NOT EXISTS updates (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sent_by TEXT NOT NULL,
  recipient_count INTEGER DEFAULT 0 NOT NULL,
  recipient_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS sessions_expire_idx ON sessions(expire);