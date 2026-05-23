"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Loader2, Check, X, ImageIcon, Upload } from "lucide-react";
import Link from "next/link";

type Repo = {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  cover_url?: string | null;
};

export default function ReposDestaquePage() {
  const router = useRouter();
  const [jwt, setJwt] = useState<string | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selected, setSelected] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTarget = useRef<string | null>(null);

  useEffect(() => {
    createBrowserClient()
      .auth.getSession()
      .then(async ({ data }) => {
        const session = data.session;
        if (!session?.access_token) { router.push("/login"); return; }
        setJwt(session.access_token);

        const [reposRes, featuredRes] = await Promise.all([
          fetch("/api/repos", { headers: { "X-GitHub-Token": session.provider_token ?? "" } }),
          fetch("/api/featured-repos", { headers: { Authorization: `Bearer ${session.access_token}` } }),
        ]);

        if (reposRes.ok) {
          const all: Repo[] = await reposRes.json();
          setRepos(Array.isArray(all) ? all : []);
        }
        if (featuredRes.ok) setSelected(await featuredRes.json());
        setLoading(false);
      });
  }, [router]);

  function toggle(repo: Repo) {
    setSelected((prev) => {
      const exists = prev.some((r) => r.full_name === repo.full_name);
      if (exists) return prev.filter((r) => r.full_name !== repo.full_name);
      if (prev.length >= 3) return prev;
      return [...prev, repo];
    });
    setSaved(false);
  }

  function triggerUpload(fullName: string) {
    uploadTarget.current = fullName;
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const target = uploadTarget.current;
    if (!file || !target || !jwt) return;

    setUploading(target);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("repo", target);

    const res = await fetch("/api/repo-cover", {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
      body: fd,
    });

    if (res.ok) {
      const { url } = await res.json();
      setSelected((prev) =>
        prev.map((r) => r.full_name === target ? { ...r, cover_url: url } : r)
      );
    }
    setUploading(null);
    e.target.value = "";
  }

  function removeCover(fullName: string) {
    setSelected((prev) =>
      prev.map((r) => r.full_name === fullName ? { ...r, cover_url: null } : r)
    );
    setSaved(false);
  }

  async function handleSave() {
    if (!jwt) return;
    setSaving(true);
    await fetch("/api/featured-repos", {
      method: "PUT",
      headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
      body: JSON.stringify({ repos: selected }),
    });
    setSaving(false);
    setSaved(true);
  }

  const isSelected = (repo: Repo) => selected.some((r) => r.full_name === repo.full_name);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Link>
          </Button>
          <span className="font-semibold text-sm">Repositórios em Destaque</span>
        </div>
      </header>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10 space-y-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Repos em Destaque</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Selecione até 3 repositórios e adicione uma capa para cada um.{" "}
              <span className="font-medium text-foreground">{selected.length}/3</span>
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving || selected.length === 0} size="sm">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <><Check className="h-4 w-4 mr-1" />Salvo!</>
            ) : (
              "Salvar"
            )}
          </Button>
        </div>

        {/* Selected repos with cover upload */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Projetos selecionados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {selected.map((repo) => (
              <SelectedCard
                key={repo.full_name}
                repo={repo}
                uploading={uploading === repo.full_name}
                onUpload={() => triggerUpload(repo.full_name)}
                onRemoveCover={() => removeCover(repo.full_name)}
                onDeselect={() => toggle(repo)}
              />
            ))}
            {Array.from({ length: 3 - selected.length }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-dashed flex items-center justify-center py-10 text-muted-foreground/40 text-sm"
              >
                Slot {selected.length + i + 1}
              </div>
            ))}
          </div>
        </section>

        {/* Repo list */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Todos os repositórios
          </h2>
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : repos.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-16">
              Nenhum repositório público encontrado.
            </p>
          ) : (
            <div className="space-y-2">
              {repos.map((repo) => {
                const active = isSelected(repo);
                const disabled = !active && selected.length >= 3;
                return (
                  <button
                    key={repo.full_name}
                    onClick={() => !disabled && toggle(repo)}
                    className={`w-full text-left rounded-lg border p-4 transition-colors ${
                      active
                        ? "border-foreground bg-foreground/5"
                        : disabled
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:border-foreground/30 hover:bg-accent/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 h-5 w-5 rounded border-2 shrink-0 flex items-center justify-center ${
                          active ? "border-foreground bg-foreground" : "border-muted-foreground"
                        }`}
                      >
                        {active && <Check className="h-3 w-3 text-background" />}
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{repo.name}</span>
                          {repo.language && (
                            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {repo.language}
                            </span>
                          )}
                          {repo.stargazers_count > 0 && (
                            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                              <Star className="h-3 w-3" />
                              {repo.stargazers_count}
                            </span>
                          )}
                        </div>
                        {repo.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {repo.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function SelectedCard({
  repo,
  uploading,
  onUpload,
  onRemoveCover,
  onDeselect,
}: {
  repo: Repo;
  uploading: boolean;
  onUpload: () => void;
  onRemoveCover: () => void;
  onDeselect: () => void;
}) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Cover */}
      <div className="relative aspect-video bg-muted group">
        {repo.cover_url ? (
          <>
            <img
              src={repo.cover_url}
              alt={repo.name}
              className="w-full h-full object-cover"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={onUpload}
                className="flex items-center gap-1 text-xs text-white bg-white/20 hover:bg-white/30 px-2 py-1 rounded-md transition-colors"
              >
                <Upload className="h-3 w-3" />
                Trocar
              </button>
              <button
                onClick={onRemoveCover}
                className="flex items-center gap-1 text-xs text-white bg-white/20 hover:bg-white/30 px-2 py-1 rounded-md transition-colors"
              >
                <X className="h-3 w-3" />
                Remover
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={onUpload}
            disabled={uploading}
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-xs">Enviando...</span>
              </>
            ) : (
              <>
                <ImageIcon className="h-5 w-5" />
                <span className="text-xs font-medium">Adicionar capa</span>
                <span className="text-[10px] text-muted-foreground">PNG · JPG · WebP · max 2MB</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{repo.name}</p>
          {repo.language && (
            <p className="text-xs text-muted-foreground">{repo.language}</p>
          )}
        </div>
        <button
          onClick={onDeselect}
          title="Remover seleção"
          className="h-6 w-6 shrink-0 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
