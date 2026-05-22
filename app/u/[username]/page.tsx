import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageSquare } from "lucide-react";
import { GitHubIcon } from "@/components/icons/github";

type Skill = { name: string; count: number };
type Post = {
  id: string;
  repo_name: string;
  tone: string;
  content: string;
  created_at: string;
};
type Profile = {
  user_id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  skills: Skill[];
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

  const { data: posts } = await supabase
    .from("posts")
    .select("id, repo_name, tone, content, created_at")
    .eq("user_id", (profile as Profile).user_id)
    .order("created_at", { ascending: false })
    .limit(10);

  return { profile: profile as Profile, posts: (posts ?? []) as Post[] };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const data = await fetchPublicProfile(username);

  if (!data) notFound();

  const { profile, posts } = data;
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

        {posts.length === 0 && profile.skills.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Este perfil ainda não possui conteúdo público.
          </p>
        )}
      </main>
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
