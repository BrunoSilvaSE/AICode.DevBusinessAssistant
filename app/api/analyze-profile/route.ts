import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { createAuthedServerClient } from "@/lib/supabase/client";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
const model = groq("llama-3.3-70b-versatile");

function extractJwt(req: Request): string | null {
  const header = req.headers.get("authorization");
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
}

const SYSTEM = `Você é um coach de carreira especializado em desenvolvedores de software.
Analise o perfil de um dev e retorne um JSON com este formato exato:

{
  "score": <número de 0 a 100>,
  "headline": "<frase de 10 palavras resumindo o perfil>",
  "strengths": ["<ponto forte 1>", "<ponto forte 2>", "<ponto forte 3>"],
  "improvements": ["<melhoria 1>", "<melhoria 2>", "<melhoria 3>"],
  "tip": "<dica de ação imediata, 1 frase>"
}

Critérios para o score:
- bio_long preenchida (+20)
- role_title preenchido (+10)
- skills detectadas (+15 se >= 5)
- repos em destaque (+20 se >= 2)
- LinkedIn preenchido (+15)
- posts gerados (+10 se >= 1)
- location preenchida (+10)

Retorne SOMENTE o JSON, sem markdown, sem explicação.`;

type ProfileData = {
  role_title: string | null;
  bio_long: string | null;
  location: string | null;
  linkedin_url: string | null;
  skills: Array<{ name: string; count: number }>;
  custom_skills: string[] | null;
  featured_repos: Array<{ name: string }>;
};

export type ProfileAnalysis = {
  score: number;
  headline: string;
  strengths: string[];
  improvements: string[];
  tip: string;
};

export async function GET(req: Request) {
  const jwt = extractJwt(req);
  if (!jwt) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const supabase = createAuthedServerClient(jwt);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const [profileRes, postsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("role_title, bio_long, location, linkedin_url, skills, custom_skills, featured_repos")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("posts")
      .select("id")
      .eq("user_id", user.id)
      .limit(1),
  ]);

  const profile = profileRes.data as ProfileData | null;
  if (!profile) return Response.json({ error: "Perfil não encontrado" }, { status: 404 });

  const postCount = postsRes.data?.length ?? 0;

  const context = JSON.stringify({
    role_title: profile.role_title,
    bio_long: profile.bio_long ? `(${profile.bio_long.length} chars)` : null,
    location: profile.location,
    linkedin_url: profile.linkedin_url ? "preenchido" : null,
    skills_count: (profile.skills ?? []).length + (profile.custom_skills ?? []).length,
    top_skills: (profile.skills ?? []).slice(0, 5).map((s) => s.name),
    featured_repos_count: (profile.featured_repos ?? []).length,
    posts_count: postCount,
  });

  const { text } = await generateText({
    model,
    system: SYSTEM,
    prompt: context,
    maxOutputTokens: 400,
    temperature: 0.3,
  });

  try {
    const analysis = JSON.parse(text) as ProfileAnalysis;
    return Response.json(analysis);
  } catch {
    return Response.json({ error: "Falha ao processar análise" }, { status: 500 });
  }
}
