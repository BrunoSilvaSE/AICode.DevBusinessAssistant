import { z } from "zod";
import { createAuthedServerClient } from "@/lib/supabase/client";

function extractJwt(req: Request): string | null {
  const header = req.headers.get("authorization");
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
}

const PostSchema = z.object({
  content: z.string().min(1, "O campo 'content' é obrigatório."),
  repo_name: z.string().optional(),
  tone: z.enum(["business", "technical"]).optional(),
});

export async function POST(req: Request) {
  const jwt = extractJwt(req);
  if (!jwt) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const supabase = createAuthedServerClient(jwt);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const raw = await req.json().catch(() => ({}));
  const parsed = PostSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { content, repo_name, tone } = parsed.data;
  const { error } = await supabase.from("posts").insert({ user_id: user.id, repo_name, tone, content });
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ success: true }, { status: 201 });
}

export async function GET(req: Request) {
  const jwt = extractJwt(req);
  if (!jwt) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const supabase = createAuthedServerClient(jwt);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
