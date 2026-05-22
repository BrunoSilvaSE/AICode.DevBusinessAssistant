import { createBrowserClient } from "@/lib/supabase/client";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const supabase = createBrowserClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !profile) {
    return Response.json({ error: "Perfil não encontrado" }, { status: 404 });
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("id, repo_name, tone, content, created_at")
    .eq("user_id", profile.user_id)
    .order("created_at", { ascending: false })
    .limit(10);

  return Response.json({ profile, posts: posts ?? [] });
}
