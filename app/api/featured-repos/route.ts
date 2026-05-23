import { createAuthedServerClient } from "@/lib/supabase/client";

function extractJwt(req: Request): string | null {
  const header = req.headers.get("authorization");
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
}

type FeaturedRepo = {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  cover_url?: string | null;
  diagram_mermaid?: string | null;
};

export async function GET(req: Request) {
  const jwt = extractJwt(req);
  if (!jwt) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const supabase = createAuthedServerClient(jwt);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const { data, error } = await supabase
    .from("profiles")
    .select("featured_repos")
    .eq("user_id", user.id)
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data?.featured_repos ?? []);
}

export async function PUT(req: Request) {
  const jwt = extractJwt(req);
  if (!jwt) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { repos } = body as { repos?: FeaturedRepo[] };

  if (!Array.isArray(repos)) {
    return Response.json({ error: "Lista de repositórios inválida" }, { status: 400 });
  }

  const supabase = createAuthedServerClient(jwt);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const { error } = await supabase
    .from("profiles")
    .update({ featured_repos: repos })
    .eq("user_id", user.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}

export async function PATCH(req: Request) {
  const jwt = extractJwt(req);
  if (!jwt) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const { full_name, diagram_mermaid } = await req.json().catch(() => ({}));
  if (!full_name) return Response.json({ error: "full_name é obrigatório" }, { status: 400 });

  const supabase = createAuthedServerClient(jwt);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const { data, error: fetchError } = await supabase
    .from("profiles")
    .select("featured_repos")
    .eq("user_id", user.id)
    .single();

  if (fetchError) return Response.json({ error: fetchError.message }, { status: 500 });

  const repos = ((data?.featured_repos ?? []) as FeaturedRepo[]).map((r) =>
    r.full_name === full_name ? { ...r, diagram_mermaid } : r
  );

  const { error } = await supabase
    .from("profiles")
    .update({ featured_repos: repos })
    .eq("user_id", user.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
