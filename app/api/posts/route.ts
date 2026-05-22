import { createAuthedServerClient } from "@/lib/supabase/client";

function extractJwt(req: Request): string | null {
  const header = req.headers.get("authorization");
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
}

export async function POST(req: Request) {
  const jwt = extractJwt(req);
  if (!jwt) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const supabase = createAuthedServerClient(jwt);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { repo_name, tone, content } = body as {
    repo_name?: string;
    tone?: string;
    content?: string;
  };

  if (!content) {
    return Response.json({ error: "O campo 'content' é obrigatório." }, { status: 400 });
  }

  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    repo_name,
    tone,
    content,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true }, { status: 201 });
}

export async function GET(req: Request) {
  const jwt = extractJwt(req);
  if (!jwt) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const supabase = createAuthedServerClient(jwt);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}
