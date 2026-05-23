"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Search, X, Loader2, FolderOpen, AlertCircle, ChevronRight } from "lucide-react";

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
          if (!res.ok) { setError("Erro ao carregar repositórios. Tente novamente."); return null; }
          return res.json();
        })
        .then((data) => { if (Array.isArray(data)) setRepos(data); })
        .catch(() => setError("Erro de conexão. Verifique sua internet."))
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

  const isFiltering = !!search || !!langFilter;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-3.5 flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Link>
          </Button>
          <span className="font-semibold text-sm">Repositórios</span>
          {!loading && repos.length > 0 && (
            <span className="ml-auto text-xs text-muted-foreground">
              {repos.length} repos
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Seus Repositórios</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Selecione um repositório para gerar posts, README ou diagrama com IA.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <p className="text-sm">Carregando repositórios do GitHub...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">Erro ao carregar</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
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
                    className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      aria-label="Limpar busca"
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {languages.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      onClick={() => setLangFilter(null)}
                      className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
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
                        className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
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

                {isFiltering && (
                  <p className="text-xs text-muted-foreground">
                    {filtered.length === 0
                      ? "Nenhum resultado encontrado"
                      : `${filtered.length} de ${repos.length} repositórios`}
                    {langFilter && <> em <span className="font-medium">{langFilter}</span></>}
                    {search && <> com "{search}"</>}
                    {" · "}
                    <button
                      onClick={() => { setSearch(""); setLangFilter(null); }}
                      className="text-primary hover:underline"
                    >
                      limpar filtros
                    </button>
                  </p>
                )}
              </div>

              {/* Empty state */}
              {repos.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
                    <FolderOpen className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="font-medium">Nenhum repositório público encontrado</p>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Verifique se sua conta do GitHub tem repositórios públicos.
                  </p>
                </div>
              )}

              {/* Filtered empty */}
              {repos.length > 0 && filtered.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <Search className="h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum resultado para essa busca.
                  </p>
                  <button
                    onClick={() => { setSearch(""); setLangFilter(null); }}
                    className="text-sm text-primary hover:underline"
                  >
                    Limpar filtros
                  </button>
                </div>
              )}

              {/* Repo list */}
              <div className="space-y-2">
                {filtered.map((repo) => (
                  <Link
                    key={repo.id}
                    href={`/repositorios/${repo.owner}/${repo.name}`}
                    className="group flex items-center rounded-xl border bg-card px-5 py-4 hover:border-primary/30 hover:shadow-sm transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">{repo.name}</p>
                      {repo.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {repo.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5">
                        {repo.language && (
                          <span className="text-xs text-muted-foreground">{repo.language}</span>
                        )}
                        {repo.stars > 0 && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3" />
                            {repo.stars}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto sm:hidden">
                          {new Date(repo.updatedAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                    <span className="hidden sm:block text-xs text-muted-foreground whitespace-nowrap shrink-0 mx-4">
                      {new Date(repo.updatedAt).toLocaleDateString("pt-BR")}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
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
