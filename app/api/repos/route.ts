import { createBrowserClient } from "@/lib/supabase/client";

export async function GET(_req: Request) {
  const supabase = createBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.provider_token) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const username = session.user.user_metadata?.user_name as string;

  const res = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=30&type=public`,
    {
      headers: {
        Authorization: `Bearer ${session.provider_token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  if (!res.ok) {
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
