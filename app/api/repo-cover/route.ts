import { createClient } from "@supabase/supabase-js";
import { createAuthedServerClient } from "@/lib/supabase/client";

function extractJwt(req: Request): string | null {
  const header = req.headers.get("authorization");
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
}

const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(req: Request) {
  const jwt = extractJwt(req);
  if (!jwt) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const authedClient = createAuthedServerClient(jwt);
  const { data: { user } } = await authedClient.auth.getUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const formData = await req.formData().catch(() => null);
  if (!formData) return Response.json({ error: "FormData inválido" }, { status: 400 });

  const file = formData.get("file") as File | null;
  const repo = formData.get("repo") as string | null;

  if (!file || !repo) {
    return Response.json({ error: "Arquivo e repositório são obrigatórios" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "Apenas imagens são aceitas (PNG, JPG, WebP)" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return Response.json({ error: "Tamanho máximo: 2MB" }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const safeName = repo.replace("/", "_").replace(/[^a-zA-Z0-9_.-]/g, "");
  const path = `${user.id}/${safeName}.${ext}`;

  // Use service role to bypass storage RLS — user already authenticated above
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await adminClient.storage
    .from("repo-covers")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = adminClient.storage
    .from("repo-covers")
    .getPublicUrl(path);

  return Response.json({ url: `${publicUrl}?t=${Date.now()}` });
}
