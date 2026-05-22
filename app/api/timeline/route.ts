import { z } from "zod";
import { createAuthedServerClient } from "@/lib/supabase/client";

function extractJwt(req: Request): string | null {
  const header = req.headers.get("authorization");
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
}

const TimelineSchema = z.object({
  type: z.enum(["work", "education", "bootcamp", "certification", "project"]),
  title: z.string().min(1, "Título é obrigatório"),
  start_date: z.string().min(1, "Data de início é obrigatória"),
  institution: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  current: z.boolean().optional().default(false),
  repo_url: z.string().url().nullable().optional(),
  repo_name: z.string().nullable().optional(),
});

export async function GET(req: Request) {
  const jwt = extractJwt(req);
  if (!jwt) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const supabase = createAuthedServerClient(jwt);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const { data, error } = await supabase
    .from("timeline_items")
    .select("*")
    .eq("user_id", user.id)
    .order("start_date", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req: Request) {
  const jwt = extractJwt(req);
  if (!jwt) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const supabase = createAuthedServerClient(jwt);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const raw = await req.json().catch(() => ({}));
  const parsed = TimelineSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { type, title, institution, description, start_date, end_date, current, repo_url, repo_name } = parsed.data;

  const { error } = await supabase.from("timeline_items").insert({
    user_id: user.id,
    type,
    title,
    institution: institution ?? null,
    description: description ?? null,
    start_date,
    end_date: end_date ?? null,
    current: current ?? false,
    repo_url: repo_url ?? null,
    repo_name: repo_name ?? null,
  });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true }, { status: 201 });
}

export async function DELETE(req: Request) {
  const jwt = extractJwt(req);
  if (!jwt) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Parâmetro 'id' obrigatório" }, { status: 400 });

  const supabase = createAuthedServerClient(jwt);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const { error } = await supabase
    .from("timeline_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
