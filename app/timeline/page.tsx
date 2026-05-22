"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
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

type TimelineItem = {
  id: string;
  type: string;
  title: string;
  institution: string | null;
  description: string | null;
  start_date: string;
  end_date: string | null;
  current: boolean;
};

type FormState = {
  type: string;
  title: string;
  institution: string;
  description: string;
  start_date: string;
  end_date: string;
  current: boolean;
};

const emptyForm: FormState = {
  type: "work",
  title: "",
  institution: "",
  description: "",
  start_date: "",
  end_date: "",
  current: false,
};

export default function TimelinePage() {
  const router = useRouter();
  const [jwt, setJwt] = useState<string | null>(null);
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    createBrowserClient()
      .auth.getSession()
      .then(({ data }) => {
        if (!data.session?.access_token) {
          router.push("/login");
          return;
        }
        setJwt(data.session.access_token);
        fetchItems(data.session.access_token);
      });
  }, [router]);

  async function fetchItems(token: string) {
    setLoading(true);
    const res = await fetch("/api/timeline", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }

  async function handleAdd() {
    if (!jwt || !form.title || !form.start_date) return;
    setSaving(true);
    const res = await fetch("/api/timeline", {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        end_date: form.current ? null : form.end_date || null,
        institution: form.institution || null,
        description: form.description || null,
      }),
    });
    if (res.ok) {
      setForm(emptyForm);
      setShowForm(false);
      await fetchItems(jwt);
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
                  onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value + "-01" }))}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Fim</label>
                <input
                  type="month"
                  value={form.end_date.slice(0, 7)}
                  onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value + "-01" }))}
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
