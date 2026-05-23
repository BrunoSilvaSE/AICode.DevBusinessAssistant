import { createAuthedServerClient } from "@/lib/supabase/client";
import { createClient } from "@supabase/supabase-js";

function extractJwt(req: Request): string | null {
  const header = req.headers.get("authorization");
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
}

async function createLikeNotification(
  postId: string,
  actorUsername: string,
  actorAvatarUrl: string | null
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: post } = await supabase
    .from("community_posts")
    .select("user_id, title, content")
    .eq("id", postId)
    .single();

  if (!post) return;

  await supabase.from("notifications").insert({
    user_id: post.user_id,
    type: "like",
    post_id: postId,
    post_title: post.title ?? post.content.slice(0, 60),
    actor_username: actorUsername,
    actor_avatar_url: actorAvatarUrl,
  });
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
    if (error.code === "23505") return Response.json({ error: "Já curtido" }, { status: 409 });
    return Response.json({ error: error.message }, { status: 500 });
  }

  const actorUsername = user.user_metadata?.user_name ?? user.email ?? "";
  const actorAvatar = user.user_metadata?.avatar_url ?? null;

  await Promise.all([
    supabase.rpc("increment_likes", { post_id: postId }),
    createLikeNotification(postId, actorUsername, actorAvatar),
  ]);

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
