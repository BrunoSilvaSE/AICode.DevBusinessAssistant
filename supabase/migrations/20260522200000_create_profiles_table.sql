-- Public portfolio profiles
CREATE TABLE IF NOT EXISTS profiles (
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username   TEXT NOT NULL UNIQUE,
  full_name  TEXT,
  avatar_url TEXT,
  bio        TEXT,
  skills     JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_public"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- Allow public read on posts so portfolio pages can show them
CREATE POLICY "posts_select_public"
  ON posts FOR SELECT USING (true);
