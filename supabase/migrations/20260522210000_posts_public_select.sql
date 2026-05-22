-- Allow public read on posts for portfolio pages
CREATE POLICY "posts_select_public"
  ON posts FOR SELECT USING (true);
