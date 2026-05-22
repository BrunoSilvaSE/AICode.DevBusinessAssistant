export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const name = searchParams.get("name");

  if (!owner || !name) {
    return Response.json({ error: "owner e name são obrigatórios" }, { status: 400 });
  }

  const githubToken = req.headers.get("x-github-token");
  if (!githubToken) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const headers = {
    Authorization: `token ${githubToken}`,
    Accept: "application/vnd.github+json",
  };

  const [repoRes, readmeRes, languagesRes] = await Promise.all([
    fetch(`https://api.github.com/repos/${owner}/${name}`, { headers }),
    fetch(`https://api.github.com/repos/${owner}/${name}/readme`, { headers }),
    fetch(`https://api.github.com/repos/${owner}/${name}/languages`, { headers }),
  ]);

  if (!repoRes.ok) {
    return Response.json({ error: "Repositório não encontrado" }, { status: 404 });
  }

  const repo = await repoRes.json();
  const languages = languagesRes.ok ? await languagesRes.json() : {};

  let readme = "";
  if (readmeRes.ok) {
    const readmeData = await readmeRes.json();
    readme = Buffer.from(readmeData.content, "base64").toString("utf-8").slice(0, 3000);
  }

  return Response.json({
    name: repo.name,
    description: repo.description,
    stars: repo.stargazers_count,
    language: repo.language,
    languages: Object.keys(languages),
    readme,
    url: repo.html_url,
    updatedAt: repo.updated_at,
  });
}
