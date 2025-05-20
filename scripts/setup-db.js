import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setupDatabase() {
  try {
    const client = await pool.connect();
    try {
      // Create or update the tables
      await client.query(`
        -- Create session table if it doesn't exist
        CREATE TABLE IF NOT EXISTS sessions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          token TEXT NOT NULL UNIQUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL
        );

        -- Create user_settings table if it doesn't exist
        CREATE TABLE IF NOT EXISTS user_settings (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          selected_cals TEXT[] DEFAULT '{}',
          default_view TEXT DEFAULT 'month',
          last_sync_time TIMESTAMP WITH TIME ZONE,
          global_tags TEXT[] DEFAULT '{}',
          active_widgets TEXT[] DEFAULT '{tasks,calendar,ataglance,quicknote}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
        );

        -- Create calendar_sources table if it doesn't exist
        CREATE TABLE IF NOT EXISTS calendar_sources (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          source_id TEXT NOT NULL,
          is_enabled BOOLEAN DEFAULT TRUE NOT NULL,
          tags TEXT[] DEFAULT '{}',
          connection_data TEXT NOT NULL,
          last_sync_time TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
        );

        -- Alter existing users table to add necessary columns
        DO $$
        BEGIN
          -- Add email column if it doesn't exist
          IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'users'::regclass AND attname = 'email') THEN
            ALTER TABLE users ADD COLUMN email TEXT UNIQUE;
          END IF;

          -- Add password_hash column if it doesn't exist
          IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'users'::regclass AND attname = 'password_hash') THEN
            ALTER TABLE users ADD COLUMN password_hash TEXT;
          END IF;

          -- Add password_salt column if it doesn't exist
          IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'users'::regclass AND attname = 'password_salt') THEN
            ALTER TABLE users ADD COLUMN password_salt TEXT;
          END IF;

          -- Add first_name column if it doesn't exist
          IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'users'::regclass AND attname = 'first_name') THEN
            ALTER TABLE users ADD COLUMN first_name TEXT;
          END IF;

          -- Add last_name column if it doesn't exist
          IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'users'::regclass AND attname = 'last_name') THEN
            ALTER TABLE users ADD COLUMN last_name TEXT;
          END IF;

          -- Add profile_image_url column if it doesn't exist
          IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'users'::regclass AND attname = 'profile_image_url') THEN
            ALTER TABLE users ADD COLUMN profile_image_url TEXT;
          END IF;

          -- Add created_at column if it doesn't exist
          IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'users'::regclass AND attname = 'created_at') THEN
            ALTER TABLE users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
          END IF;

          -- Add updated_at column if it doesn't exist
          IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'users'::regclass AND attname = 'updated_at') THEN
            ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
          END IF;
        END $$;
      `);

      // Create test user with credentials
      await client.query(`
        -- Create a test user (only if it doesn't exist)
        INSERT INTO users (email, password_hash, password_salt, first_name, last_name)
        SELECT 
          'amascaro08@gmail.com', 
          'f30aa7ea83367bbbb7e44cf766db13967fc630a1811c7e7c11eba51aae7a5462d4a960d48a8a7025f2a491c3df8c8f667b72007c102cce8fde9ab29ec48e96c6', 
          'c4f7fc37fbb3f2710c1f4eafec56f0d0', 
          'Test', 
          'User'
        WHERE 
          NOT EXISTS (SELECT 1 FROM users WHERE email = 'amascaro08@gmail.com');

        -- Create user settings for test user (only if they don't exist)
        INSERT INTO user_settings (user_id, selected_cals, default_view, global_tags, active_widgets)
        SELECT 
          u.id,
          ARRAY['primary', 'work'],
          'month',
          ARRAY['work', 'personal', 'family', 'health'],
          ARRAY['tasks', 'calendar', 'ataglance', 'quicknote', 'habits']
        FROM 
          users u
        WHERE 
          u.email = 'amascaro08@gmail.com'
          AND NOT EXISTS (SELECT 1 FROM user_settings WHERE user_id = u.id);

        -- Create sample calendar sources for test user (only if they don't exist)
        INSERT INTO calendar_sources (user_id, name, type, source_id, is_enabled, tags, connection_data)
        SELECT 
          u.id,
          'Personal Google Calendar',
          'google',
          'primary',
          TRUE,
          ARRAY['personal'],
          '{"access_token":"mock-token","refresh_token":"mock-refresh-token","expiry_date":' || (EXTRACT(EPOCH FROM NOW() + INTERVAL '1 hour') * 1000)::bigint || '}'
        FROM 
          users u
        WHERE 
          u.email = 'amascaro08@gmail.com'
          AND NOT EXISTS (
            SELECT 1 FROM calendar_sources 
            WHERE user_id = u.id AND name = 'Personal Google Calendar'
          );

        INSERT INTO calendar_sources (user_id, name, type, source_id, is_enabled, tags, connection_data)
        SELECT 
          u.id,
          'Work Microsoft Calendar',
          'o365',
          'primary',
          TRUE,
          ARRAY['work'],
          '{"access_token":"mock-token","refresh_token":"mock-refresh-token","expires_at":' || (EXTRACT(EPOCH FROM NOW() + INTERVAL '1 hour') * 1000)::bigint || '}'
        FROM 
          users u
        WHERE 
          u.email = 'amascaro08@gmail.com'
          AND NOT EXISTS (
            SELECT 1 FROM calendar_sources 
            WHERE user_id = u.id AND name = 'Work Microsoft Calendar'
          );
      `);

      console.log('Database setup completed successfully');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();