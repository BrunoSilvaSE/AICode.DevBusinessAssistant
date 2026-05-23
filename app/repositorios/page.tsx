"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, RefreshCw, Search, X } from "lucide-react";

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
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const providerToken = data.session?.provider_token;
      if (!providerToken) {
        router.push("/login");
        return;
      }

      fetch("/api/repos", {
        headers: { "X-GitHub-Token": providerToken },
      })
        .then((res) => {
          if (res.status === 401) { router.push("/login"); return null; }
          if (!res.ok) { setError("Erro ao carregar repositórios."); return null; }
          return res.json();
        })
        .then((data) => { if (Array.isArray(data)) setRepos(data); })
        .catch(() => setError("Erro ao carregar repositórios."))
        .finally(() => setLoading(false));
    });
  }, [router]);

  const languages = Array.from(
    new Set(repos.map((r) => r.language).filter(Boolean))
  ).sort() as string[];

  const filtered = repos.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      (r.description ?? "").toLowerCase().includes(q);
    const matchesLang = !langFilter || r.language === langFilter;
    return matchesSearch && matchesLang;
  });

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

          {!loading && !error && (
            <>
              {/* Search + language filter */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou descrição..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {languages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setLangFilter(null)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                        !langFilter
                          ? "bg-foreground text-background border-foreground"
                          : "bg-background text-muted-foreground border-border hover:border-foreground/40"
                      }`}
                    >
                      Todos
                    </button>
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLangFilter(langFilter === lang ? null : lang)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                          langFilter === lang
                            ? "bg-foreground text-background border-foreground"
                            : "bg-background text-muted-foreground border-border hover:border-foreground/40"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {repos.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Nenhum repositório público encontrado.
                </p>
              )}

              {repos.length > 0 && filtered.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Nenhum resultado para "{search}"{langFilter ? ` em ${langFilter}` : ""}.
                </p>
              )}

              <div className="space-y-3">
                {filtered.map((repo) => (
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
            </>
          )}
        </div>
      </main>
    </div>
  );
}
