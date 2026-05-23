"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, ExternalLink, CheckCircle } from "lucide-react";
import Link from "next/link";

type ProfileForm = {
  role_title: string;
  bio_long: string;
  location: string;
  linkedin_url: string;
};

export default function EditarPerfilPage() {
  const router = useRouter();
  const [jwt, setJwt] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileForm>({
    role_title: "",
    bio_long: "",
    location: "",
    linkedin_url: "",
  });

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      if (!session?.access_token) {
        router.push("/login");
        return;
      }
      setJwt(session.access_token);
      setUsername(session.user.user_metadata?.user_name ?? null);

      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const profile = await res.json();
        setForm({
          role_title: profile.role_title ?? "",
          bio_long: profile.bio_long ?? "",
          location: profile.location ?? "",
          linkedin_url: profile.linkedin_url ?? "",
        });
      }
      setLoading(false);
    });
  }, [router]);

  async function handleSave() {
    if (!jwt) return;
    setSaving(true);
    setError(null);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Erro ao salvar");
    }
  }

  function field(key: keyof ProfileForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
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
          <span className="font-semibold text-sm">Editar Perfil Público</span>
          {username && (
            <Link
              href={`/u/${username}`}
              target="_blank"
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver portfólio
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10 space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Perfil Público</h1>
          <p className="text-sm text-muted-foreground">
            Estas informações aparecem no seu portfólio em{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/u/{username}</code>
          </p>
        </div>

        <div className="space-y-6">
          <FormField
            label="Título / Função"
            hint="Ex: Full Stack Developer, Engenheiro de Software, Desenvolvedor Backend"
          >
            <input
              type="text"
              value={form.role_title}
              onChange={(e) => field("role_title", e.target.value)}
              placeholder="Full Stack Developer"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </FormField>

          <FormField
            label="Sobre Mim"
            hint="Apresentação profissional detalhada. Aparece na seção 'Sobre Mim' do portfólio público."
          >
            <textarea
              value={form.bio_long}
              onChange={(e) => field("bio_long", e.target.value)}
              placeholder="Escreva sua apresentação profissional aqui. Fale sobre sua trajetória, tecnologias favoritas, projetos de destaque e objetivos profissionais..."
              rows={7}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {form.bio_long.length}/3000
            </p>
          </FormField>

          <FormField label="Localização" hint="Ex: São Paulo, SP · Brasil">
            <input
              type="text"
              value={form.location}
              onChange={(e) => field("location", e.target.value)}
              placeholder="São Paulo, SP · Brasil"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </FormField>

          <FormField label="LinkedIn" hint="URL completa do seu perfil LinkedIn (opcional)">
            <input
              type="url"
              value={form.linkedin_url}
              onChange={(e) => field("linkedin_url", e.target.value)}
              placeholder="https://linkedin.com/in/seu-usuario"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </FormField>
        </div>

        {error && (
          <p className="text-sm text-red-500 rounded-md border border-red-200 bg-red-50 dark:bg-red-950/20 px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saved ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Salvo!
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Salvando..." : "Salvar alterações"}
              </>
            )}
          </Button>
          {username && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/u/${username}`} target="_blank">
                Abrir portfólio
              </Link>
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <p className="text-xs text-muted-foreground">{hint}</p>
      {children}
    </div>
  );
}
