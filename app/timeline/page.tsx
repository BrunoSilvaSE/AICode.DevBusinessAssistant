"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Trash2, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";

const TYPE_LABELS: Record<string, string> = {
  work: "Experiência",
  education: "Formação",
  bootcamp: "Bootcamp",
  certification: "Certificação",
  project: "Projeto",
};

const TYPE_COLORS: Record<string, string> = {
  work: "bg-blue-500",
  education: "bg-purple-500",
  bootcamp: "bg-orange-500",
  certification: "bg-green-500",
  project: "bg-pink-500",
};

type Repo = { name: string; full_name: string; html_url: string };

type TimelineItem = {
  id: string;
  type: string;
  title: string;
  institution: string | null;
  description: string | null;
  start_date: string;
  end_date: string | null;
  current: boolean;
  repo_url: string | null;
  repo_name: string | null;
};

type FormState = {
  type: string;
  title: string;
  institution: string;
  description: string;
  start_date: string;
  end_date: string;
  current: boolean;
  repo_full_name: string;
};

const emptyForm: FormState = {
  type: "work",
  title: "",
  institution: "",
  description: "",
  start_date: "",
  end_date: "",
  current: false,
  repo_full_name: "",
};

export default function TimelinePage() {
  const router = useRouter();
  const [jwt, setJwt] = useState<string | null>(null);
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    createBrowserClient()
      .auth.getSession()
      .then(async ({ data }) => {
        const session = data.session;
        if (!session?.access_token) { router.push("/login"); return; }
        setJwt(session.access_token);

        const [itemsRes, reposRes] = await Promise.all([
          fetch("/api/timeline", { headers: { Authorization: `Bearer ${session.access_token}` } }),
          session.provider_token
            ? fetch("/api/repos", { headers: { "X-GitHub-Token": session.provider_token } })
            : Promise.resolve(null),
        ]);

        if (itemsRes.ok) setItems(await itemsRes.json());
        if (reposRes?.ok) {
          const all = await reposRes.json();
          setRepos(Array.isArray(all) ? all : []);
        }
        setLoading(false);
      });
  }, [router]);

  async function handleAdd() {
    if (!jwt || !form.title || !form.start_date) return;
    setSaving(true);

    const selectedRepo = repos.find((r) => r.full_name === form.repo_full_name);
    const res = await fetch("/api/timeline", {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        type: form.type,
        title: form.title,
        institution: form.institution || null,
        description: form.description || null,
        start_date: form.start_date ? `${form.start_date}-01` : form.start_date,
        end_date: form.current ? null : form.end_date ? `${form.end_date}-01` : null,
        current: form.current,
        repo_url: selectedRepo?.html_url ?? null,
        repo_name: selectedRepo?.name ?? null,
      }),
    });

    if (res.ok) {
      const updated = await fetch("/api/timeline", { headers: { Authorization: `Bearer ${jwt}` } });
      if (updated.ok) setItems(await updated.json());
      setForm(emptyForm);
      setShowForm(false);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!jwt) return;
    await fetch(`/api/timeline?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${jwt}` },
    });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Link>
          </Button>
          <span className="font-semibold text-sm">Minha Linha do Tempo</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Linha do Tempo</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Formação, experiências e certificações que aparecem no seu portfólio.
            </p>
          </div>
          <Button onClick={() => setShowForm((v) => !v)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>

        {showForm && (
          <div className="rounded-lg border bg-card p-5 space-y-4">
            <h2 className="font-semibold text-sm">Novo item</h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Tipo *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  {Object.entries(TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Título *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: Desenvolvedor Full Stack"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-medium">Empresa / Instituição</label>
                <input
                  value={form.institution}
                  onChange={(e) => setForm((f) => ({ ...f, institution: e.target.value }))}
                  placeholder="Ex: Acme Corp, UFSC, Alura..."
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Início *</label>
                <input
                  type="month"
                  value={form.start_date}
                  onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Fim</label>
                <input
                  type="month"
                  value={form.end_date}
                  onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                  disabled={form.current}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm disabled:opacity-40"
                />
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.current}
                    onChange={(e) => setForm((f) => ({ ...f, current: e.target.checked }))}
                  />
                  Atual
                </label>
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-medium">Descrição</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="O que você fez, aprendeu ou conquistou aqui..."
                  rows={3}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none"
                />
              </div>

              {repos.length > 0 && (
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-medium">Repositório vinculado (opcional)</label>
                  <select
                    value={form.repo_full_name}
                    onChange={(e) => setForm((f) => ({ ...f, repo_full_name: e.target.value }))}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">— Nenhum —</option>
                    {repos.map((r) => (
                      <option key={r.full_name} value={r.full_name}>{r.full_name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setForm(emptyForm); }}>
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={saving || !form.title || !form.start_date}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground text-sm">
            Nenhum item ainda. Clique em "Adicionar" para começar.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-4 rounded-lg border bg-card p-4">
                <div className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${TYPE_COLORS[item.type] ?? "bg-muted"}`} />
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{item.title}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {TYPE_LABELS[item.type]}
                    </span>
                    {item.current && (
                      <span className="text-xs text-green-600 bg-green-50 dark:bg-green-950 px-1.5 py-0.5 rounded">
                        Atual
                      </span>
                    )}
                  </div>
                  {item.institution && (
                    <p className="text-xs text-muted-foreground">{item.institution}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDate(item.start_date)} → {item.current ? "presente" : item.end_date ? formatDate(item.end_date) : "—"}
                  </p>
                  {item.repo_url && (
                    <a
                      href={item.repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {item.repo_name ?? item.repo_url}
                    </a>
                  )}
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
}
