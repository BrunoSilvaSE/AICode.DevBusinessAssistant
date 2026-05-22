import { createAuthedServerClient } from "@/lib/supabase/client";
import { calculateSkills } from "@/lib/utils";

export async function POST(req: Request) {
  const jwt = req.headers.get("authorization")?.replace("Bearer ", "") ?? null;
  const githubToken = req.headers.get("x-github-token");

  if (!jwt || !githubToken) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { userId, username, fullName, avatarUrl } = body as {
    userId: string;
    username: string;
    fullName: string | null;
    avatarUrl: string | null;
  };

  const ghHeaders = {
    Authorization: `token ${githubToken}`,
    Accept: "application/vnd.github+json",
  };

  const [reposRes, ghUserRes] = await Promise.all([
    fetch("https://api.github.com/user/repos?sort=updated&per_page=100&type=public", {
      headers: ghHeaders,
    }),
    fetch("https://api.github.com/user", { headers: ghHeaders }),
  ]);

  const repos = reposRes.ok ? await reposRes.json() : [];
  const ghUser = ghUserRes.ok ? await ghUserRes.json() : {};

  const skills = calculateSkills(repos);

  const supabase = createAuthedServerClient(jwt);
  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: userId,
      username,
      full_name: fullName ?? ghUser.name ?? username,
      avatar_url: avatarUrl ?? ghUser.avatar_url,
      bio: ghUser.bio ?? null,
      skills,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
