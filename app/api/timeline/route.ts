import { createAuthedServerClient } from "@/lib/supabase/client";

function extractJwt(req: Request): string | null {
  const header = req.headers.get("authorization");
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
}

const VALID_TYPES = ["work", "education", "bootcamp", "certification", "project"] as const;
type TimelineType = (typeof VALID_TYPES)[number];

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

  const body = await req.json().catch(() => ({}));
  const { type, title, institution, description, start_date, end_date, current } = body as {
    type?: string;
    title?: string;
    institution?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    current?: boolean;
  };

  if (!type || !VALID_TYPES.includes(type as TimelineType) || !title || !start_date) {
    return Response.json(
      { error: "Campos obrigatórios: type, title, start_date" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("timeline_items").insert({
    user_id: user.id,
    type,
    title,
    institution: institution ?? null,
    description: description ?? null,
    start_date,
    end_date: end_date ?? null,
    current: current ?? false,
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
