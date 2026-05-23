import { createClient } from "@supabase/supabase-js";
import { getMasteryLevel } from "@/lib/utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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

  type RawSkill = { name: string; count: number; first_year?: number };
  const skills = ((profile.skills ?? []) as RawSkill[]).map((s) => ({
    ...s,
    mastery: getMasteryLevel(s.count).label,
  }));

  return Response.json({ profile: { ...profile, skills }, posts: posts ?? [] });
}
