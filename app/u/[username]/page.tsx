import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageSquare, ChevronRight, Star, ExternalLink } from "lucide-react";
import { GitHubIcon } from "@/components/icons/github";

type Skill = { name: string; count: number };
type Post = {
  id: string;
  repo_name: string;
  tone: string;
  content: string;
  created_at: string;
};
type FeaturedRepo = {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
};
type Profile = {
  user_id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  skills: Skill[];
  featured_repos: FeaturedRepo[];
};
type TimelineItem = {
  id: string;
  type: string;
  title: string;
  institution: string | null;
  start_date: string;
  end_date: string | null;
  current: boolean;
};

const TYPE_LABELS: Record<string, string> = {
  work: "Experiência",
  education: "Formação",
  bootcamp: "Bootcamp",
  certification: "Certificação",
  project: "Projeto",
};

const TYPE_DOT: Record<string, string> = {
  work: "bg-blue-500",
  education: "bg-purple-500",
  bootcamp: "bg-orange-500",
  certification: "bg-green-500",
  project: "bg-pink-500",
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
      .limit(10),
    supabase
      .from("timeline_items")
      .select("id, type, title, institution, start_date, end_date, current")
      .eq("user_id", (profile as Profile).user_id)
      .order("start_date", { ascending: false })
      .limit(4),
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <span className="font-semibold text-sm tracking-tight">
            Dev Business Assistant
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 space-y-10">
        {/* Hero */}
        <section className="flex items-center gap-6">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="h-20 w-20 rounded-full border"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
              {displayName[0].toUpperCase()}
            </div>
          )}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
            <p className="text-muted-foreground text-sm flex items-center gap-1.5">
              <GitHubIcon className="h-4 w-4" />
              @{profile.username}
            </p>
            {profile.bio && (
              <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
            )}
          </div>
        </section>

        {/* Featured Repos */}
        {profile.featured_repos?.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-semibold text-lg">Projetos em Destaque</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {profile.featured_repos.map((repo) => (
                <a
                  key={repo.full_name}
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-lg border bg-card p-4 space-y-2 hover:border-foreground/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-sm group-hover:underline">{repo.name}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  </div>
                  {repo.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{repo.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {repo.language && <span>{repo.language}</span>}
                    {repo.stargazers_count > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3" />
                        {repo.stargazers_count}
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Skill Tree */}
        {profile.skills.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-semibold text-lg">Skill Tree</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <SkillBadge key={skill.name} skill={skill} />
              ))}
            </div>
          </section>
        )}

        {/* Mini Timeline */}
        {timeline.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">Linha do Tempo</h2>
              <Link
                href={`/u/${username}/timeline`}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Ver completa
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />
              <div className="space-y-4">
                {timeline.map((item) => (
                  <MiniTimelineItem key={item.id} item={item} />
                ))}
              </div>
            </div>
            <Link
              href={`/u/${username}/timeline`}
              className="flex items-center justify-center gap-1.5 w-full rounded-lg border border-dashed py-3 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              Ver linha do tempo completa
              <ChevronRight className="h-4 w-4" />
            </Link>
          </section>
        )}

        {/* Posts */}
        {posts.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-semibold text-lg">Posts Gerados</h2>
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}

        {posts.length === 0 && profile.skills.length === 0 && timeline.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Este perfil ainda não possui conteúdo público.
          </p>
        )}
      </main>
    </div>
  );
}

function MiniTimelineItem({ item }: { item: TimelineItem }) {
  const dot = TYPE_DOT[item.type] ?? "bg-muted";
  const start = new Date(item.start_date).toLocaleDateString("pt-BR", {
    month: "short",
    year: "numeric",
  });
  const end = item.current
    ? "presente"
    : item.end_date
    ? new Date(item.end_date).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    : null;

  return (
    <div className="relative pl-9">
      <div className={`absolute left-0 top-1 h-6 w-6 rounded-full ${dot} flex items-center justify-center`}>
        <span className="text-[10px] text-white font-bold">{TYPE_LABELS[item.type]?.[0]}</span>
      </div>
      <div>
        <p className="text-sm font-medium leading-tight">{item.title}</p>
        {item.institution && (
          <p className="text-xs text-muted-foreground">{item.institution}</p>
        )}
        <p className="text-xs text-muted-foreground mt-0.5">
          {start}{end ? ` → ${end}` : ""}
        </p>
      </div>
    </div>
  );
}

function SkillBadge({ skill }: { skill: Skill }) {
  const size =
    skill.count >= 10 ? "text-base px-3 py-1" : "text-sm px-2.5 py-0.5";
  return (
    <Badge variant="secondary" className={size}>
      {skill.name}
      <span className="ml-1.5 text-muted-foreground text-xs">{skill.count}</span>
    </Badge>
  );
}

function PostCard({ post }: { post: Post }) {
  const date = new Date(post.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="rounded-lg border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" />
          {post.repo_name ?? "Standalone"}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {date}
        </span>
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap line-clamp-6">
        {post.content}
      </p>
    </div>
  );
}
