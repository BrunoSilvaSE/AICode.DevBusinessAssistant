"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, RefreshCw } from "lucide-react";

type Repo = {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  updatedAt: string;
  owner: string;
};

export default function RepositoriosPage() {
  const router = useRouter();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/repos")
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setRepos(data);
      })
      .catch(() => setError("Erro ao carregar repositórios."))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Link>
          </Button>
          <span className="font-semibold text-sm">Repositórios</span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Seus Repositórios</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Selecione um repositório para gerar um post.
            </p>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Carregando repositórios...
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {!loading && !error && repos.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Nenhum repositório público encontrado.
            </p>
          )}

          <div className="space-y-3">
            {repos.map((repo) => (
              <Link
                key={repo.id}
                href={`/repositorios/${repo.owner}/${repo.name}`}
                className="block rounded-lg border bg-card p-5 hover:border-foreground/30 hover:bg-accent/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <p className="font-medium text-sm truncate">{repo.name}</p>
                    {repo.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {repo.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 pt-1">
                      {repo.language && (
                        <span className="text-xs text-muted-foreground">
                          {repo.language}
                        </span>
                      )}
                      {repo.stars > 0 && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3" />
                          {repo.stars}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                    {new Date(repo.updatedAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
