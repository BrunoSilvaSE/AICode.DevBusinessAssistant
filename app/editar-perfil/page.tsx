"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { useCompletion } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, ExternalLink, CheckCircle, Plus, X, Eye, EyeOff, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";

type Skill = { name: string; count: number };

type ProfileForm = {
  role_title: string;
  bio_long: string;
  location: string;
  linkedin_url: string;
  whatsapp: string;
  instagram_url: string;
  custom_skills: string[];
  hidden_skills: string[];
};

export default function EditarPerfilPage() {
  const router = useRouter();
  const [jwt, setJwt] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedSkills, setDetectedSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [form, setForm] = useState<ProfileForm>({
    role_title: "",
    bio_long: "",
    location: "",
    linkedin_url: "",
    whatsapp: "",
    instagram_url: "",
    custom_skills: [],
    hidden_skills: [],
  });

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      if (!session?.access_token) { router.push("/login"); return; }
      setJwt(session.access_token);
      setUsername(session.user.user_metadata?.user_name ?? null);

      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const profile = await res.json();
        setDetectedSkills(profile.skills ?? []);
        setForm({
          role_title: profile.role_title ?? "",
          bio_long: profile.bio_long ?? "",
          location: profile.location ?? "",
          linkedin_url: profile.linkedin_url ?? "",
          whatsapp: profile.whatsapp ?? "",
          instagram_url: profile.instagram_url ?? "",
          custom_skills: profile.custom_skills ?? [],
          hidden_skills: profile.hidden_skills ?? [],
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

  function addCustomSkill() {
    const name = newSkill.trim();
    if (!name || form.custom_skills.includes(name)) return;
    setForm((f) => ({ ...f, custom_skills: [...f.custom_skills, name] }));
    setNewSkill("");
  }

  function removeCustomSkill(name: string) {
    setForm((f) => ({ ...f, custom_skills: f.custom_skills.filter((s) => s !== name) }));
  }

  function toggleHidden(name: string) {
    setForm((f) => ({
      ...f,
      hidden_skills: f.hidden_skills.includes(name)
        ? f.hidden_skills.filter((s) => s !== name)
        : [...f.hidden_skills, name],
    }));
  }

  const isHidden = (name: string) => form.hidden_skills.includes(name);

  const { completion: bioCompletion, complete: completeBio, isLoading: bioGenerating } = useCompletion({
    api: "/api/generate-bio",
    streamProtocol: "text",
    headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
    onFinish: (_, completion) => {
      if (completion) field("bio_long", completion);
    },
  });

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

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10 space-y-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Perfil Público</h1>
          <p className="text-sm text-muted-foreground">
            Visível em{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/u/{username}</code>
          </p>
        </div>

        {/* ── Informações básicas ── */}
        <section className="space-y-6">
          <h2 className="text-base font-semibold border-b pb-2">Informações</h2>

          <FormField label="Título / Função" hint="Ex: Full Stack Developer, Engenheiro de Software">
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
            hint="Apresentação profissional. Aparece na seção 'Sobre Mim' do portfólio."
          >
            <div className="relative">
              <textarea
                value={bioGenerating ? bioCompletion : form.bio_long}
                onChange={(e) => field("bio_long", e.target.value)}
                placeholder="Escreva sua apresentação aqui ou gere com IA..."
                rows={6}
                disabled={bioGenerating}
                className="input-base resize-none w-full"
              />
              {bioGenerating && (
                <div className="absolute inset-0 rounded-md bg-background/50 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={bioGenerating || !jwt}
                onClick={() => completeBio("")}
                className="flex items-center gap-1.5 text-xs"
              >
                {bioGenerating ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" />Gerando...</>
                ) : (
                  <><Sparkles className="h-3.5 w-3.5" />Gerar com IA</>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">{form.bio_long.length}/3000</p>
            </div>
          </FormField>

          <FormField label="Localização" hint="Ex: Recife, PE · Brasil">
            <input
              type="text"
              value={form.location}
              onChange={(e) => field("location", e.target.value)}
              placeholder="Recife, PE · Brasil"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </FormField>
        </section>

        {/* ── Redes Sociais ── */}
        <section className="space-y-6">
          <h2 className="text-base font-semibold border-b pb-2">Redes Sociais</h2>

          <FormField label="LinkedIn" hint="URL completa do perfil">
            <input type="url" value={form.linkedin_url} onChange={(e) => field("linkedin_url", e.target.value)} placeholder="https://linkedin.com/in/seu-usuario" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </FormField>

          <FormField label="WhatsApp" hint="Número com DDI e DDD, sem espaços (ex: 5581999999999)">
            <div className="flex">
              <span className="flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-muted-foreground text-sm">+</span>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => field("whatsapp", e.target.value.replace(/\D/g, ""))}
                placeholder="5581999999999"
                className="flex-1 rounded-r-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </FormField>

          <FormField label="Instagram" hint="URL do perfil no Instagram">
            <input type="url" value={form.instagram_url} onChange={(e) => field("instagram_url", e.target.value)} placeholder="https://instagram.com/seu-usuario" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </FormField>
        </section>

        {/* ── Tecnologias ── */}
        <section className="space-y-6">
          <h2 className="text-base font-semibold border-b pb-2">Tecnologias</h2>

          {/* Detected skills — toggle visibility */}
          {detectedSkills.length > 0 && (
            <FormField
              label="Detectadas nos repositórios"
              hint="Clique para mostrar ou esconder no portfólio público."
            >
              <div className="flex flex-wrap gap-2 mt-1">
                {detectedSkills.map((skill) => {
                  const hidden = isHidden(skill.name);
                  return (
                    <button
                      key={skill.name}
                      type="button"
                      onClick={() => toggleHidden(skill.name)}
                      title={hidden ? "Exibir no portfólio" : "Esconder do portfólio"}
                      className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                        hidden
                          ? "border-dashed text-muted-foreground/50 line-through bg-muted/30"
                          : "border-foreground/20 bg-background hover:border-foreground/40"
                      }`}
                    >
                      {hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      {skill.name}
                      <span className="text-muted-foreground">·{skill.count}</span>
                    </button>
                  );
                })}
              </div>
            </FormField>
          )}

          {/* Custom skills — add manually */}
          <FormField
            label="Adicionar tecnologia"
            hint="Adicione habilidades que não aparecem nos repositórios (ex: AWS, Figma, Docker)."
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomSkill(); } }}
                placeholder="Ex: AWS, Docker, Figma..."
                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button type="button" variant="outline" size="sm" onClick={addCustomSkill}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {form.custom_skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.custom_skills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1.5 rounded-full border border-primary/20"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeCustomSkill(skill)}
                      className="hover:text-red-500 transition-colors ml-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </FormField>
        </section>

        {error && (
          <p className="text-sm text-red-500 rounded-md border border-red-200 bg-red-50 dark:bg-red-950/20 px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2 pb-10">
          <Button onClick={handleSave} disabled={saving}>
            {saved ? (
              <><CheckCircle className="h-4 w-4 mr-2" />Salvo!</>
            ) : (
              <><Save className="h-4 w-4 mr-2" />{saving ? "Salvando..." : "Salvar alterações"}</>
            )}
          </Button>
          {username && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/u/${username}`} target="_blank">Abrir portfólio</Link>
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

function FormField({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <p className="text-xs text-muted-foreground">{hint}</p>
      {children}
    </div>
  );
}
