export async function GET(req: Request) {
  const githubToken = req.headers.get("x-github-token");
  if (!githubToken) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const res = await fetch(
    "https://api.github.com/user/repos?sort=updated&per_page=100&type=public",
    {
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  if (!res.ok) {
    const detail = await res.text();
    console.error("GitHub API error:", res.status, detail);
    return Response.json({ error: "Erro ao buscar repos do GitHub" }, { status: 502 });
  }

  const repos = await res.json();

  return Response.json(
    repos.map((r: {
      id: number;
      name: string;
      description: string | null;
      language: string | null;
      stargazers_count: number;
      updated_at: string;
      html_url: string;
      owner: { login: string };
    }) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      updatedAt: r.updated_at,
      url: r.html_url,
      owner: r.owner.login,
    }))
  );
}
