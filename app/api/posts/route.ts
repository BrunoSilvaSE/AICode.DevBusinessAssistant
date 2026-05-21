import { createBrowserClient } from "@/lib/supabase/client";

export async function POST(req: Request) {
  const supabase = createBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
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
    user_id: session.user.id,
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
  const supabase = createBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}
