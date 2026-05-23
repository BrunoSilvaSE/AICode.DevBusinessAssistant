import { z } from "zod";
import { createAuthedServerClient } from "@/lib/supabase/client";

function extractJwt(req: Request): string | null {
  const header = req.headers.get("authorization");
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
}

const ProfileUpdateSchema = z.object({
  bio_long: z.string().max(3000).nullable().optional(),
  role_title: z.string().max(100).nullable().optional(),
  linkedin_url: z.string().nullable().optional(),
  location: z.string().max(100).nullable().optional(),
});

export async function GET(req: Request) {
  const jwt = extractJwt(req);
  if (!jwt) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const supabase = createAuthedServerClient(jwt);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const { data, error } = await supabase
    .from("profiles")
    .select("bio_long, role_title, linkedin_url, location")
    .eq("user_id", user.id)
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data ?? {});
}

export async function PATCH(req: Request) {
  const jwt = extractJwt(req);
  if (!jwt) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const supabase = createAuthedServerClient(jwt);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const raw = await req.json().catch(() => ({}));
  const parsed = ProfileUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const updates: Record<string, string | null> = {};
  if ("bio_long" in parsed.data) updates.bio_long = parsed.data.bio_long ?? null;
  if ("role_title" in parsed.data) updates.role_title = parsed.data.role_title ?? null;
  if ("linkedin_url" in parsed.data) updates.linkedin_url = parsed.data.linkedin_url || null;
  if ("location" in parsed.data) updates.location = parsed.data.location ?? null;

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("user_id", user.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
