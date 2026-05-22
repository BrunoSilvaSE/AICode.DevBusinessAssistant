CREATE TABLE IF NOT EXISTS timeline_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('work', 'education', 'bootcamp', 'certification', 'project')),
  title       TEXT NOT NULL,
  institution TEXT,
  description TEXT,
  start_date  DATE NOT NULL,
  end_date    DATE,
  current     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE timeline_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "timeline_select_public"
  ON timeline_items FOR SELECT USING (true);

CREATE POLICY "timeline_insert_own"
  ON timeline_items FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "timeline_update_own"
  ON timeline_items FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "timeline_delete_own"
  ON timeline_items FOR DELETE USING (auth.uid() = user_id);
