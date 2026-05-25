import { createClient } from "@supabase/supabase-js";
import { createAuthedServerClient } from "@/lib/supabase/client";

function extractJwt(req: Request): string | null {
  const header = req.headers.get("authorization");
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
}

// Tries to find a publicly accessible frontend URL for the repo.
// Priority: homepage field → GitHub Pages → index.html in common dirs.
async function detectFrontendUrl(
  owner: string,
  repo: string,
  githubToken: string | null
): Promise<string | null> {
  const ghHeaders: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "DevBusinessAssistant",
  };
  if (githubToken) ghHeaders.Authorization = `token ${githubToken}`;

  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: ghHeaders,
  });
  if (!repoRes.ok) return null;

  const repoData = await repoRes.json();

  // 1. Explicit homepage URL (e.g. Vercel/Netlify deploy)
  if (repoData.homepage && repoData.homepage.startsWith("http")) {
    return repoData.homepage;
  }

  // 2. GitHub Pages is enabled
  if (repoData.has_pages) {
    return `https://${owner}.github.io/${repo}/`;
  }

  // 3. Look for index.html in common frontend paths
  const paths = ["index.html", "public/index.html", "dist/index.html", "docs/index.html", "src/index.html"];
  for (const path of paths) {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      { headers: ghHeaders }
    );
    if (res.ok) {
      // Has index.html — try GitHub Pages URL even if not officially enabled
      return `https://${owner}.github.io/${repo}/`;
    }
  }

  return null;
}

export async function POST(req: Request) {
  const jwt = extractJwt(req);
  if (!jwt) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const authedClient = createAuthedServerClient(jwt);
  const { data: { user } } = await authedClient.auth.getUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { owner, repo, full_name } = body as { owner?: string; repo?: string; full_name?: string };
  if (!owner || !repo || !full_name) {
    return Response.json({ error: "owner, repo e full_name são obrigatórios" }, { status: 400 });
  }

  const githubToken = req.headers.get("x-github-token");

  const frontendUrl = await detectFrontendUrl(owner, repo, githubToken);
  if (!frontendUrl) {
    return Response.json({ error: "Nenhum frontend encontrado neste repositório." }, { status: 404 });
  }

  // Screenshot via thum.io — free, no API key, returns JPEG directly at 16:9
  const screenshotUrl = `https://image.thum.io/get/width/1200/crop/630/noanimate/${encodeURIComponent(frontendUrl)}`;

  const imgRes = await fetch(screenshotUrl, {
    headers: { "User-Agent": "DevBusinessAssistant/1.0" },
    signal: AbortSignal.timeout(20000),
  });

  if (!imgRes.ok) {
    return Response.json({ error: "Falha ao capturar screenshot." }, { status: 502 });
  }

  const imgBuffer = await imgRes.arrayBuffer();
  if (imgBuffer.byteLength < 1024) {
    return Response.json({ error: "Screenshot retornou imagem inválida." }, { status: 502 });
  }

  const safeName = full_name.replace("/", "_").replace(/[^a-zA-Z0-9_.-]/g, "");
  const path = `${user.id}/${safeName}.jpg`;

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: uploadError } = await adminClient.storage
    .from("repo-covers")
    .upload(path, imgBuffer, { upsert: true, contentType: "image/jpeg" });

  if (uploadError) {
    return Response.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = adminClient.storage
    .from("repo-covers")
    .getPublicUrl(path);

  return Response.json({ url: publicUrl, source: frontendUrl });
}
