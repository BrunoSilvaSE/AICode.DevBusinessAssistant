import { createClient } from "@supabase/supabase-js";
import { getMasteryLevel } from "@/lib/utils";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

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
    .select(
      "username, full_name, avatar_url, bio, bio_long, role_title, location, linkedin_url, skills, custom_skills, hidden_skills, featured_repos"
    )
    .eq("username", username)
    .single();

  if (error || !profile) {
    return Response.json(
      { error: "Perfil não encontrado" },
      { status: 404, headers: CORS }
    );
  }

  type RawSkill = { name: string; count: number; first_year?: number };

  const hiddenSet = new Set((profile.hidden_skills ?? []) as string[]);
  const rawSkills = ((profile.skills ?? []) as RawSkill[]).filter(
    (s) => !hiddenSet.has(s.name)
  );

  const skills = rawSkills.map((s) => ({
    name: s.name,
    count: s.count,
    first_year: s.first_year ?? null,
    mastery: getMasteryLevel(s.count).label,
    years_active: s.first_year ? new Date().getFullYear() - s.first_year + 1 : null,
  }));

  const customSkills = ((profile.custom_skills ?? []) as string[]).filter(
    (name) => !rawSkills.some((s) => s.name === name)
  );

  const payload = {
    username: profile.username,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
    role_title: profile.role_title,
    bio: profile.bio,
    bio_long: profile.bio_long,
    location: profile.location,
    linkedin_url: profile.linkedin_url,
    skills,
    custom_skills: customSkills,
    featured_repos: profile.featured_repos ?? [],
    _meta: {
      api_version: "1",
      docs: "https://devbusinessassistant.vercel.app/api/public/{username}",
      generated_at: new Date().toISOString(),
    },
  };

  return Response.json(payload, { headers: CORS });
}
