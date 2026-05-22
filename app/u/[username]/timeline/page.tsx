import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

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

const TYPE_LABELS: Record<string, string> = {
  work: "Experiência",
  education: "Formação",
  bootcamp: "Bootcamp",
  certification: "Certificação",
  project: "Projeto",
};

const TYPE_COLORS: Record<string, string> = {
  work: "bg-blue-500 border-blue-500",
  education: "bg-purple-500 border-purple-500",
  bootcamp: "bg-orange-500 border-orange-500",
  certification: "bg-green-500 border-green-500",
  project: "bg-pink-500 border-pink-500",
};

const TYPE_BG: Record<string, string> = {
  work: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
  education: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800",
  bootcamp: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800",
  certification: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
  project: "bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800",
};

function serverSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function fetchTimeline(username: string) {
  const supabase = serverSupabase();

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id, username, full_name, avatar_url")
    .eq("username", username)
    .single();

  if (!profile) return null;

  const { data: items } = await supabase
    .from("timeline_items")
    .select("*")
    .eq("user_id", profile.user_id)
    .order("start_date", { ascending: false });

  return { profile, items: (items ?? []) as TimelineItem[] };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

function duration(start: string, end: string | null, current: boolean) {
  const s = new Date(start);
  const e = current ? new Date() : end ? new Date(end) : null;
  if (!e) return null;
  const months =
    (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  if (months < 1) return "menos de 1 mês";
  if (months < 12) return `${months} ${months === 1 ? "mês" : "meses"}`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m > 0 ? `${y} ano${y > 1 ? "s" : ""} e ${m} ${m === 1 ? "mês" : "meses"}` : `${y} ano${y > 1 ? "s" : ""}`;
}

export default async function FullTimelinePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const data = await fetchTimeline(username);

  if (!data) notFound();

  const { profile, items } = data;
  const displayName = profile.full_name ?? profile.username;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href={`/u/${username}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao portfólio
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12 space-y-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Linha do Tempo — {displayName}
          </h1>
          <p className="text-muted-foreground text-sm">
            Formação, experiências e conquistas em ordem cronológica.
          </p>
        </div>

        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum item ainda.</p>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />

            <div className="space-y-8">
              {items.map((item, i) => {
                const dot = TYPE_COLORS[item.type] ?? "bg-muted border-muted";
                const card = TYPE_BG[item.type] ?? "bg-card border-border";
                const dur = duration(item.start_date, item.end_date, item.current);
                const isFirst = i === 0;

                return (
                  <div key={item.id} className="relative pl-12">
                    {/* Dot */}
                    <div
                      className={`absolute left-0 top-1.5 h-8 w-8 rounded-full border-2 ${dot} bg-background flex items-center justify-center`}
                    >
                      <TypeIcon type={item.type} />
                    </div>

                    <div className={`rounded-xl border p-5 space-y-3 ${card}`}>
                      {/* Header */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            {TYPE_LABELS[item.type]}
                          </span>
                          {item.current && (
                            <span className="text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded-full">
                              Atual
                            </span>
                          )}
                          {isFirst && !item.current && (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              Mais recente
                            </span>
                          )}
                        </div>
                        <h2 className="text-lg font-semibold leading-tight">{item.title}</h2>
                        {item.institution && (
                          <p className="text-sm font-medium text-muted-foreground">
                            {item.institution}
                          </p>
                        )}
                      </div>

                      {/* Dates */}
                      <div className="text-sm text-muted-foreground space-y-0.5">
                        <p>
                          {formatDate(item.start_date)} →{" "}
                          {item.current
                            ? "presente"
                            : item.end_date
                            ? formatDate(item.end_date)
                            : "—"}
                        </p>
                        {dur && (
                          <p className="text-xs">Duração: {dur}</p>
                        )}
                      </div>

                      {/* Repo link */}
                      {item.repo_url && (
                        <a
                          href={item.repo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          {item.repo_name ?? item.repo_url}
                        </a>
                      )}

                      {/* Description */}
                      {item.description && (
                        <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap border-t pt-3">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function TypeIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    work: "💼",
    education: "🎓",
    bootcamp: "🚀",
    certification: "🏆",
    project: "🛠️",
  };
  return <span className="text-xs">{icons[type] ?? "📌"}</span>;
}
