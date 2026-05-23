import { createAuthedServerClient } from "@/lib/supabase/client";

function extractJwt(req: Request): string | null {
  const header = req.headers.get("authorization");
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  const jwt = extractJwt(req);
  if (!jwt) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const supabase = createAuthedServerClient(jwt);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const { error } = await supabase
    .from("post_likes")
    .insert({ post_id: postId, user_id: user.id });

  if (error) {
    // Duplicate = already liked
    if (error.code === "23505") {
      return Response.json({ error: "Já curtido" }, { status: 409 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  await supabase.rpc("increment_likes", { post_id: postId });
  return Response.json({ liked: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  const jwt = extractJwt(req);
  if (!jwt) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const supabase = createAuthedServerClient(jwt);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const { error } = await supabase
    .from("post_likes")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", user.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  await supabase.rpc("decrement_likes", { post_id: postId });
  return Response.json({ liked: false });
}
