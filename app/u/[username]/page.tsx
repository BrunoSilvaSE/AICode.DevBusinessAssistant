import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ExternalLink, Star, ChevronRight, ArrowRight } from "lucide-react";
import { GitHubIcon } from "@/components/icons/github";
import { PortfolioNav } from "./PortfolioNav";
import { SkillsSection } from "./SkillsSection";
import { ContactForm } from "./ContactForm";
import { MermaidDiagram } from "@/components/MermaidDiagram";
import { CopyLinkedInButton } from "@/components/CopyLinkedInButton";

type Skill = { name: string; count: number };
type Post = { id: string; repo_name: string; tone: string; content: string; created_at: string };
type FeaturedRepo = {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  cover_url?: string | null;
  diagram_mermaid?: string | null;
};
type Profile = {
  user_id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  bio_long: string | null;
  role_title: string | null;
  linkedin_url: string | null;
  whatsapp: string | null;
  instagram_url: string | null;
  location: string | null;
  skills: Skill[];
  custom_skills: string[] | null;
  hidden_skills: string[] | null;
  featured_repos: FeaturedRepo[];
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
  repo_url: string | null;
  repo_name: string | null;
};

const TYPE_META: Record<string, { label: string; icon: string; dot: string; pill: string }> = {
  work: { label: "Experiência", icon: "💼", dot: "bg-blue-500", pill: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  education: { label: "Formação", icon: "🎓", dot: "bg-purple-500", pill: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  bootcamp: { label: "Bootcamp", icon: "🚀", dot: "bg-orange-500", pill: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" },
  certification: { label: "Certificação", icon: "🏆", dot: "bg-green-500", pill: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  project: { label: "Projeto", icon: "🛠️", dot: "bg-pink-500", pill: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300" },
};

const LANG_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Python: "bg-green-500",
  Java: "bg-orange-500",
  "C#": "bg-purple-500",
  Go: "bg-cyan-500",
  Rust: "bg-orange-700",
  Ruby: "bg-red-500",
  PHP: "bg-indigo-500",
  Swift: "bg-orange-400",
  Kotlin: "bg-violet-500",
  Dart: "bg-blue-400",
  HTML: "bg-orange-600",
  CSS: "bg-blue-600",
  Shell: "bg-gray-500",
  Vue: "bg-emerald-500",
};

function serverSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function fetchPublicProfile(username: string) {
  const supabase = serverSupabase();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !profile) return null;

  const [postsResult, timelineResult] = await Promise.all([
    supabase
      .from("posts")
      .select("id, repo_name, tone, content, created_at")
      .eq("user_id", (profile as Profile).user_id)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("timeline_items")
      .select("*")
      .eq("user_id", (profile as Profile).user_id)
      .order("start_date", { ascending: false }),
  ]);

  return {
    profile: profile as Profile,
    posts: (postsResult.data ?? []) as Post[],
    timeline: (timelineResult.data ?? []) as TimelineItem[],
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const data = await fetchPublicProfile(username);

  if (!data) notFound();
  const { profile, posts, timeline } = data;
  const displayName = profile.full_name ?? profile.username;
  const hiddenSet = new Set(profile.hidden_skills ?? []);
  const visibleSkills = (profile.skills ?? []).filter((s) => !hiddenSet.has(s.name));
  const customSkills = profile.custom_skills ?? [];

  const hasSkills = visibleSkills.length > 0 || customSkills.length > 0;

  const navItems = [
    { href: "#inicio", label: "Início" },
    ...(profile.bio_long ? [{ href: "#sobre", label: "Sobre" }] : []),
    ...(hasSkills ? [{ href: "#habilidades", label: "Habilidades" }] : []),
    ...(profile.featured_repos?.length > 0 ? [{ href: "#projetos", label: "Projetos" }] : []),
    ...(timeline.length > 0 ? [{ href: "#experiencia", label: "Experiência" }] : []),
    ...(posts.length > 0 ? [{ href: "#posts", label: "Posts" }] : []),
    { href: "#contato", label: "Contato" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PortfolioNav items={navItems} />

      {/* ── HERO ── */}
      <section
        id="inicio"
        className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white overflow-hidden -mt-[53px] pt-[53px]"
      >
        {/* Decorative glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 py-20 sm:py-28">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 text-center sm:text-left">
            {/* Avatar */}
            <div className="shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="h-32 w-32 rounded-full ring-4 ring-white/20 shadow-2xl"
                />
              ) : (
                <div className="h-32 w-32 rounded-full ring-4 ring-white/20 bg-slate-700 flex items-center justify-center text-4xl font-bold">
                  {displayName[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-1">
                  Portfólio
                </p>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{displayName}</h1>
                {profile.role_title && (
                  <p className="text-lg sm:text-xl text-slate-300 mt-2">{profile.role_title}</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-slate-400 text-sm">
                {profile.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </span>
                )}
                {profile.bio && !profile.bio_long && (
                  <span className="text-slate-400 italic">{profile.bio}</span>
                )}
              </div>

              {/* Social links */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <a
                  href={`https://github.com/${profile.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
                >
                  <GitHubIcon className="h-4 w-4" />
                  GitHub
                </a>
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0077B5]/80 hover:bg-[#0077B5] transition-colors text-sm font-medium"
                  >
                    <LinkedInIcon className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
                {profile.whatsapp && (
                  <a
                    href={`https://wa.me/${profile.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366]/80 hover:bg-[#25D366] transition-colors text-sm font-medium"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    WhatsApp
                  </a>
                )}
                {profile.instagram_url && (
                  <a
                    href={profile.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#833ab4]/80 via-[#fd1d1d]/80 to-[#fcb045]/80 hover:from-[#833ab4] hover:via-[#fd1d1d] hover:to-[#fcb045] transition-colors text-sm font-medium"
                  >
                    <InstagramIcon className="h-4 w-4" />
                    Instagram
                  </a>
                )}
              </div>

              {/* Stats */}
              {(hasSkills || timeline.length > 0 || posts.length > 0) && (
                <div className="flex items-center justify-center sm:justify-start gap-8 pt-1 border-t border-white/10">
                  {hasSkills && (
                    <HeroStat value={visibleSkills.length + customSkills.length} label="tecnologias" />
                  )}
                  {profile.featured_repos?.length > 0 && (
                    <HeroStat value={profile.featured_repos.length} label="projetos" />
                  )}
                  {timeline.length > 0 && (
                    <HeroStat value={timeline.length} label="experiências" />
                  )}
                  {posts.length > 0 && (
                    <HeroStat value={posts.length} label="posts" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── SOBRE MIM ── */}
      {profile.bio_long && (
        <section id="sobre" className="py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-6">
            <SectionHeader label="Apresentação" title="Sobre Mim" />
            <div className="mt-8 max-w-2xl space-y-4">
              {profile.bio_long.split("\n").filter(Boolean).map((para, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── HABILIDADES ── */}
      {hasSkills && (
        <section id="habilidades" className="py-16 sm:py-24 bg-muted/40">
          <div className="max-w-4xl mx-auto px-6">
            <SectionHeader label="Stack Técnica" title="Habilidades" />
            <p className="mt-2 mb-8 text-sm text-muted-foreground">
              Clique em uma tecnologia para ver os repositórios relacionados.
            </p>
            <SkillsSection
              skills={visibleSkills}
              customSkills={customSkills}
              username={profile.username}
            />
          </div>
        </section>
      )}

      {/* ── PROJETOS ── */}
      {profile.featured_repos?.length > 0 && (
        <section id="projetos" className="py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-6">
            <SectionHeader label="GitHub" title="Projetos em Destaque" />
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.featured_repos.map((repo) => (
                <RepoCard key={repo.full_name} repo={repo} username={username} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── EXPERIÊNCIA ── */}
      {timeline.length > 0 && (
        <section id="experiencia" className="py-16 sm:py-24 bg-muted/40">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-end justify-between">
              <SectionHeader label="Trajetória" title="Experiência" />
              <Link
                href={`/u/${username}/timeline`}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-1"
              >
                Ver completa <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 relative">
              <div className="absolute left-5 top-2 bottom-2 w-px bg-border" />
              <div className="space-y-5">
                {timeline.slice(0, 5).map((item) => (
                  <TimelineCard key={item.id} item={item} />
                ))}
              </div>
            </div>
            {timeline.length > 5 && (
              <Link
                href={`/u/${username}/timeline`}
                className="mt-6 flex items-center justify-center gap-2 w-full rounded-xl border border-dashed py-3.5 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                Ver todas as {timeline.length} experiências
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ── POSTS ── */}
      {posts.length > 0 && (
        <section id="posts" className="py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-6">
            <SectionHeader label="LinkedIn" title="Posts Gerados por IA" />
            <p className="mt-2 text-sm text-muted-foreground">
              Posts criados com base nos repositórios do GitHub.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CONTATO ── */}
      <section
        id="contato"
        className="py-16 sm:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white"
      >
        <div className="max-w-4xl mx-auto px-6 space-y-10">
          <div className="text-center space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              Contato
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold">Vamos Conversar?</h2>
            <p className="text-slate-400 max-w-sm mx-auto text-sm">
              Preencha o formulário ou entre em contato pelas redes sociais.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={`https://github.com/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 transition-colors font-medium text-sm"
              >
                <GitHubIcon className="h-5 w-5" />
                GitHub
              </a>
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0077B5] text-white hover:bg-[#005885] transition-colors font-medium text-sm"
                >
                  <LinkedInIcon className="h-5 w-5" />
                  LinkedIn
                </a>
              )}
              {profile.whatsapp && (
                <a
                  href={`https://wa.me/${profile.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white hover:bg-[#1da851] transition-colors font-medium text-sm"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  WhatsApp
                </a>
              )}
              {profile.instagram_url && (
                <a
                  href={profile.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white hover:opacity-90 transition-opacity font-medium text-sm"
                >
                  <InstagramIcon className="h-5 w-5" />
                  Instagram
                </a>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-500 uppercase tracking-widest">ou envie uma mensagem</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <ContactForm username={profile.username} />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 text-center py-5 text-xs">
        Portfólio gerado por{" "}
        <a href="/" className="hover:text-slate-300 transition-colors underline underline-offset-2">
          Dev Business Assistant
        </a>
      </footer>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function HeroStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="pt-4 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">{label}</p>
      <h2 className="text-2xl sm:text-3xl font-bold mt-1">{title}</h2>
    </div>
  );
}


function RepoCard({ repo, username }: { repo: FeaturedRepo; username: string }) {
  const langColor = LANG_COLORS[repo.language ?? ""] ?? "bg-slate-400";
  return (
    <div className="flex flex-col gap-3">
      <Link
        href={`/u/${username}/p/${repo.name}`}
        className="group flex flex-col rounded-xl border bg-card overflow-hidden hover:border-foreground/30 hover:shadow-md transition-all"
      >
        {/* Cover image */}
        <div className="aspect-video w-full overflow-hidden bg-muted">
          {repo.cover_url ? (
            <img
              src={repo.cover_url}
              alt={repo.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
              <GitHubIcon className="h-8 w-8 text-muted-foreground/20" />
            </div>
          )}
        </div>
        {/* Content */}
        <div className="p-4 space-y-2 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2">
            <span className="font-semibold text-sm leading-tight group-hover:underline">
              {repo.name}
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {repo.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{repo.description}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {repo.language && (
              <span className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${langColor}`} />
                {repo.language}
              </span>
            )}
            {repo.stargazers_count > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {repo.stargazers_count}
              </span>
            )}
          </div>
        </div>
      </Link>
      {repo.diagram_mermaid && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground px-1">Arquitetura</p>
          <MermaidDiagram chart={repo.diagram_mermaid} />
        </div>
      )}
    </div>
  );
}

function TimelineCard({ item }: { item: TimelineItem }) {
  const meta = TYPE_META[item.type] ?? { label: item.type, icon: "📌", dot: "bg-muted-foreground", pill: "bg-muted text-muted-foreground" };
  const start = new Date(item.start_date + "T00:00:00").toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
  const end = item.current
    ? "presente"
    : item.end_date
    ? new Date(item.end_date + "T00:00:00").toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    : null;

  return (
    <div className="relative pl-14">
      <div className={`absolute left-0 top-1 h-10 w-10 rounded-full ${meta.dot} flex items-center justify-center text-base shadow-sm`}>
        {meta.icon}
      </div>
      <div className="rounded-xl border bg-background p-4 space-y-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="space-y-0.5">
            <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${meta.pill}`}>
              {meta.label}
            </span>
            <h3 className="font-semibold text-sm leading-tight">{item.title}</h3>
            {item.institution && (
              <p className="text-xs text-muted-foreground">{item.institution}</p>
            )}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 shrink-0 pt-0.5">
            <Calendar className="h-3 w-3" />
            {start}{end ? ` → ${end}` : ""}
            {item.current && (
              <span className="ml-1 text-green-600 dark:text-green-400 font-medium">(atual)</span>
            )}
          </div>
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground leading-relaxed border-t pt-2">
            {item.description}
          </p>
        )}
        {item.repo_url && (
          <a
            href={item.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            {item.repo_name ?? "Ver repositório"}
          </a>
        )}
      </div>
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const date = new Date(post.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return (
    <div className="rounded-xl border bg-card p-5 space-y-3 flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <Badge variant={post.tone === "business" ? "default" : "secondary"} className="text-[10px]">
          {post.tone === "business" ? "Negócio" : "Técnico"}
        </Badge>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {date}
        </span>
      </div>
      {post.repo_name && (
        <p className="text-xs font-medium text-muted-foreground">— {post.repo_name}</p>
      )}
      <p className="text-sm leading-relaxed whitespace-pre-wrap line-clamp-8 flex-1">
        {post.content}
      </p>
      <div className="pt-1 border-t flex justify-end">
        <CopyLinkedInButton text={post.content} />
      </div>
    </div>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}
