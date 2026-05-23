import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { createAuthedServerClient } from "@/lib/supabase/client";

function extractJwt(req: Request): string | null {
  const header = req.headers.get("authorization");
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
}

const CreatePostSchema = z.object({
  content: z.string().min(10, "O post precisa de pelo menos 10 caracteres.").max(3000),
  title: z.string().max(120).optional(),
  repo_name: z.string().optional(),
  tone: z.enum(["business", "technical", "free"]).default("free"),
  tags: z.array(z.string().max(30)).max(5).default([]),
  category: z.enum(["discussion", "showcase"]).default("discussion"),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const tone = searchParams.get("tone"); // "business" | "technical" | "free" | null
  const sort = searchParams.get("sort") ?? "recent"; // "recent" | "popular"
  const limit = 20;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const tag = searchParams.get("tag");
  const category = searchParams.get("category");

  let query = supabase
    .from("community_posts")
    .select("id, username, full_name, avatar_url, title, content, repo_name, tone, tags, category, likes_count, comments_count, created_at")
    .limit(limit + 1);

  if (tone) query = query.eq("tone", tone);
  if (category) query = query.eq("category", category);
  if (tag) query = query.contains("tags", [tag]);

  if (sort === "popular") {
    query = query.order("likes_count", { ascending: false }).order("created_at", { ascending: false });
    if (cursor) {
      // cursor is "likes_count:created_at" for keyset pagination on popular
      const [likesStr, ts] = cursor.split("|");
      const likes = parseInt(likesStr, 10);
      // Approximate: skip posts with more likes or same likes but older
      query = query.or(`likes_count.lt.${likes},and(likes_count.eq.${likes},created_at.lt.${ts})`);
    }
  } else {
    query = query.order("created_at", { ascending: false });
    if (cursor) query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const hasMore = data.length > limit;
  const posts = hasMore ? data.slice(0, limit) : data;

  let nextCursor: string | null = null;
  if (hasMore) {
    const last = posts[posts.length - 1];
    nextCursor = sort === "popular"
      ? `${last.likes_count}|${last.created_at}`
      : last.created_at;
  }

  return Response.json({ posts, nextCursor });
}

export async function POST(req: Request) {
  const jwt = extractJwt(req);
  if (!jwt) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const supabase = createAuthedServerClient(jwt);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const raw = await req.json().catch(() => ({}));
  const parsed = CreatePostSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { content, title, repo_name, tone, tags, category } = parsed.data;

  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      user_id: user.id,
      username: user.user_metadata?.user_name ?? user.email,
      full_name: user.user_metadata?.full_name ?? null,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      content,
      title: title || null,
      repo_name: repo_name || null,
      tone,
      tags,
      category,
    })
    .select("id")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ id: data.id }, { status: 201 });
}
