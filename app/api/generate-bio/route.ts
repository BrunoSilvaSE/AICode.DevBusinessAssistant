import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { createAuthedServerClient } from "@/lib/supabase/client";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
const model = groq("llama-3.3-70b-versatile");

function extractJwt(req: Request): string | null {
  const header = req.headers.get("authorization");
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
}

const SYSTEM = `Você é um redator profissional especializado em bios para portfólios de desenvolvedores.

Dado o perfil de um desenvolvedor, escreva uma bio profissional em português para a seção "Sobre Mim" do portfólio.

REGRAS:
- 2 a 3 parágrafos curtos, separados por quebra de linha
- Tom: profissional mas acessível, primeira pessoa
- Destaque tecnologias principais e área de atuação
- Mencione paixão por desenvolvimento, não clichês vazios
- Entre 150 e 300 palavras
- Retorne SOMENTE o texto da bio, sem títulos, sem markdown, sem aspas`;

export async function POST(req: Request) {
  const jwt = extractJwt(req);
  if (!jwt) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const supabase = createAuthedServerClient(jwt);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role_title, skills, custom_skills, featured_repos")
    .eq("user_id", user.id)
    .single();

  type Skill = { name: string; count: number };
  type FeaturedRepo = { name: string; description: string | null };

  const skills = ((profile?.skills ?? []) as Skill[]).map((s) => s.name);
  const customSkills = (profile?.custom_skills ?? []) as string[];
  const allSkills = [...new Set([...skills, ...customSkills])];
  const repos = ((profile?.featured_repos ?? []) as FeaturedRepo[])
    .map((r) => r.description ? `${r.name} (${r.description})` : r.name)
    .slice(0, 4);

  const context = [
    profile?.role_title ? `Título: ${profile.role_title}` : "",
    allSkills.length > 0 ? `Tecnologias: ${allSkills.join(", ")}` : "",
    repos.length > 0 ? `Projetos em destaque: ${repos.join("; ")}` : "",
  ].filter(Boolean).join("\n");

  if (!context.trim()) {
    return Response.json({ error: "Perfil sem informações suficientes para gerar bio" }, { status: 400 });
  }

  const result = await streamText({
    model,
    system: SYSTEM,
    prompt: context,
    maxOutputTokens: 400,
    temperature: 0.7,
  });

  return result.toTextStreamResponse();
}
