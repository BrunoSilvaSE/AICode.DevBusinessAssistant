import { createClient } from "@supabase/supabase-js";
import { createAuthedServerClient } from "@/lib/supabase/client";

function extractJwt(req: Request): string | null {
  const header = req.headers.get("authorization");
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
}

async function detectFrontendUrl(
  owner: string,
  repo: string,
  githubToken: string | null
): Promise<{ url: string; hasFrontend: boolean }> {
  const ghHeaders: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "DevBusinessAssistant",
  };
  if (githubToken) ghHeaders.Authorization = `token ${githubToken}`;

  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: ghHeaders });
  if (repoRes.ok) {
    const repoData = await repoRes.json();

    // 1. Explicit homepage (Vercel/Netlify/etc.)
    if (repoData.homepage?.startsWith("http")) {
      return { url: repoData.homepage, hasFrontend: true };
    }

    // 2. GitHub Pages enabled
    if (repoData.has_pages) {
      return { url: `https://${owner}.github.io/${repo}/`, hasFrontend: true };
    }
  }

  // 3. Look for index.html in common frontend paths
  const paths = ["index.html", "public/index.html", "dist/index.html", "docs/index.html", "src/index.html"];
  for (const path of paths) {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      { headers: ghHeaders }
    );
    if (res.ok) {
      return { url: `https://${owner}.github.io/${repo}/`, hasFrontend: true };
    }
  }

  // 4. No frontend found — use GitHub's social card as fallback
  return {
    url: `https://opengraph.githubassets.com/1/${owner}/${repo}`,
    hasFrontend: false,
  };
}

// Tries multiple screenshot services. Returns ArrayBuffer or null.
async function captureScreenshot(targetUrl: string): Promise<{ buffer: ArrayBuffer; contentType: string } | null> {
  const services = [
    // Microlink — returns JSON with hosted screenshot URL
    async () => {
      const res = await fetch(
        `https://api.microlink.io/?url=${encodeURIComponent(targetUrl)}&screenshot=true&meta=false`,
        { signal: AbortSignal.timeout(25000) }
      );
      if (!res.ok) return null;
      const data = await res.json();
      const imgUrl: string | undefined = data?.data?.screenshot?.url;
      if (!imgUrl) return null;
      const imgRes = await fetch(imgUrl, { signal: AbortSignal.timeout(10000) });
      if (!imgRes.ok) return null;
      const buffer = await imgRes.arrayBuffer();
      return buffer.byteLength > 5000 ? { buffer, contentType: "image/png" } : null;
    },
    // thum.io — returns JPEG directly
    async () => {
      const url = `https://image.thum.io/get/width/1200/crop/630/noanimate/${encodeURIComponent(targetUrl)}`;
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; DevBusinessAssistant)" },
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) return null;
      const ct = res.headers.get("content-type") ?? "";
      if (!ct.startsWith("image/")) return null;
      const buffer = await res.arrayBuffer();
      return buffer.byteLength > 5000 ? { buffer, contentType: "image/jpeg" } : null;
    },
  ];

  for (const attempt of services) {
    try {
      const result = await attempt();
      if (result) return result;
    } catch {
      // try next
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
  const { url: targetUrl, hasFrontend } = await detectFrontendUrl(owner, repo, githubToken);

  let imgData: { buffer: ArrayBuffer; contentType: string } | null = null;

  if (hasFrontend) {
    imgData = await captureScreenshot(targetUrl);
  }

  // Fallback: GitHub's social preview (always works, no screenshot service needed)
  if (!imgData) {
    try {
      const ogUrl = `https://opengraph.githubassets.com/1/${owner}/${repo}`;
      const res = await fetch(ogUrl, { signal: AbortSignal.timeout(10000) });
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        imgData = { buffer, contentType: "image/png" };
      }
    } catch {
      // nothing
    }
  }

  if (!imgData) {
    return Response.json({ error: "Não foi possível gerar uma capa para este repositório." }, { status: 502 });
  }

  const ext = imgData.contentType === "image/png" ? "png" : "jpg";
  const safeName = full_name.replace("/", "_").replace(/[^a-zA-Z0-9_.-]/g, "");
  const path = `${user.id}/${safeName}.${ext}`;

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: uploadError } = await adminClient.storage
    .from("repo-covers")
    .upload(path, imgData.buffer, { upsert: true, contentType: imgData.contentType });

  if (uploadError) {
    return Response.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = adminClient.storage
    .from("repo-covers")
    .getPublicUrl(path);

  return Response.json({
    url: publicUrl,
    source: targetUrl,
    hasFrontend,
  });
}
