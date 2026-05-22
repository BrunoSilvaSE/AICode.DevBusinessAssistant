-- Featured repos on public portfolio
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS featured_repos JSONB DEFAULT '[]'::jsonb;

-- Repo link on timeline items
ALTER TABLE timeline_items
  ADD COLUMN IF NOT EXISTS repo_url  TEXT,
  ADD COLUMN IF NOT EXISTS repo_name TEXT;
