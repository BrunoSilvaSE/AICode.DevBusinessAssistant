"use client";

import { useState } from "react";
import { ExternalLink, X, Calendar } from "lucide-react";
import { getMasteryLevel } from "@/lib/utils";

type Skill = { name: string; count: number; first_year?: number };
type GithubRepo = {
  name: string;
  html_url: string;
  language: string | null;
  description: string | null;
  stargazers_count: number;
  pushed_at: string;
};

const GITHUB_LANGUAGES = new Set([
  "TypeScript", "JavaScript", "Python", "Java", "C#", "C++", "C", "Go", "Rust",
  "Ruby", "PHP", "Swift", "Kotlin", "Dart", "HTML", "CSS", "Shell",
  "Jupyter Notebook", "Vue", "Elixir", "Scala", "R", "Lua", "Haskell",
  "Sass", "Perl", "Objective-C", "Nim", "Clojure",
]);

const DEVICON: Record<string, [string, string]> = {
  TypeScript: ["typescript", "original"],
  JavaScript: ["javascript", "original"],
  Python: ["python", "original"],
  Java: ["java", "original"],
  "C#": ["csharp", "original"],
  "C++": ["cplusplus", "original"],
  C: ["c", "original"],
  Go: ["go", "original"],
  Rust: ["rust", "plain"],
  Ruby: ["ruby", "original"],
  PHP: ["php", "original"],
  Swift: ["swift", "original"],
  Kotlin: ["kotlin", "original"],
  Dart: ["dart", "original"],
  HTML: ["html5", "original"],
  CSS: ["css3", "original"],
  Shell: ["bash", "original"],
  "Jupyter Notebook": ["jupyter", "original"],
  Vue: ["vuejs", "original"],
  React: ["react", "original"],
  Angular: ["angularjs", "original"],
  Svelte: ["svelte", "original"],
  Docker: ["docker", "original"],
  Kubernetes: ["kubernetes", "plain"],
  PostgreSQL: ["postgresql", "original"],
  MySQL: ["mysql", "original"],
  MongoDB: ["mongodb", "original"],
  Redis: ["redis", "original"],
  GraphQL: ["graphql", "plain"],
  Firebase: ["firebase", "plain"],
  Flutter: ["flutter", "original"],
  Elixir: ["elixir", "original"],
  Scala: ["scala", "original"],
  R: ["r", "original"],
  Lua: ["lua", "original"],
  Haskell: ["haskell", "original"],
  Sass: ["sass", "original"],
  "Next.js": ["nextjs", "original"],
  "Node.js": ["nodejs", "original"],
  Git: ["git", "original"],
  Linux: ["linux", "original"],
  Terraform: ["terraform", "original"],
  AWS: ["amazonwebservices", "original"],
  Azure: ["azure", "original"],
  Clojure: ["clojure", "original"],
  Perl: ["perl", "original"],
  "Objective-C": ["objectivec", "plain"],
};

function deviconUrl(name: string): string | null {
  const v = DEVICON[name];
  if (!v) return null;
  return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${v[0]}/${v[0]}-${v[1]}.svg`;
}

function SkillIcon({ name }: { name: string }) {
  const [failed, setFailed] = useState(false);
  const url = deviconUrl(name);

  if (!url || failed) {
    const colors = [
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
      "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
      "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
      "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
      "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
    ];
    const color = colors[name.charCodeAt(0) % colors.length];
    return (
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold ${color}`}>
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={name}
      width={40}
      height={40}
      className="h-10 w-10 object-contain"
      onError={() => setFailed(true)}
    />
  );
}

function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 30) return `${days}d atrás`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}m atrás`;
  return `${Math.floor(months / 12)}a atrás`;
}

export function SkillsSection({
  skills,
  customSkills,
  username,
}: {
  skills: Skill[];
  customSkills: string[];
  username: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [allRepos, setAllRepos] = useState<GithubRepo[] | null>(null);
  const [loadingRepos, setLoadingRepos] = useState(false);

  const maxCount = skills[0]?.count ?? 1;
  const currentYear = new Date().getFullYear();

  const customAsSkills: Skill[] = customSkills
    .filter((name) => !skills.some((s) => s.name === name))
    .map((name) => ({ name, count: 0 }));

  const allSkills = [...skills, ...customAsSkills];

  async function handleClick(name: string) {
    if (selected === name) { setSelected(null); return; }
    setSelected(name);

    const isCustomOnly = customAsSkills.some((s) => s.name === name);
    const isFramework = !GITHUB_LANGUAGES.has(name);
    if (isCustomOnly || isFramework || allRepos !== null) return;

    setLoadingRepos(true);
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated&type=public`
    );
    if (res.ok) setAllRepos(await res.json());
    setLoadingRepos(false);
  }

  const selectedIsCustomOnly = selected ? customAsSkills.some((s) => s.name === selected) : false;
  const selectedIsFramework = selected
    ? !GITHUB_LANGUAGES.has(selected) && !customAsSkills.some((s) => s.name === selected)
    : false;

  const filteredRepos =
    selected && allRepos && !selectedIsFramework
      ? allRepos
          .filter((r) => r.language?.toLowerCase() === selected.toLowerCase())
          .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
      : [];

  const selectedSkill = allSkills.find((s) => s.name === selected);

  return (
    <div className="space-y-6">
      {/* Icon grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {allSkills.map((skill) => {
          const isActive = selected === skill.name;
          const isCustom = skill.count === 0 && customAsSkills.some((c) => c.name === skill.name);
          const pct = skill.count > 0 ? Math.max(12, Math.round((skill.count / maxCount) * 100)) : null;
          const mastery = !isCustom && skill.count > 0 ? getMasteryLevel(skill.count) : null;
          const years = skill.first_year ? currentYear - skill.first_year + 1 : null;

          return (
            <button
              key={skill.name}
              onClick={() => handleClick(skill.name)}
              title={mastery ? `${skill.name} · ${mastery.label} · ${skill.count} repos` : skill.name}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center ${
                isActive
                  ? "border-foreground/50 bg-foreground/5 shadow-sm ring-1 ring-foreground/10"
                  : "bg-background hover:border-foreground/20 hover:bg-accent/30"
              }`}
            >
              <SkillIcon name={skill.name} />
              <span className="text-xs font-medium leading-tight line-clamp-2">{skill.name}</span>

              {mastery && (
                <span className={`text-[9px] font-semibold uppercase tracking-wide ${mastery.className}`}>
                  {mastery.label}
                </span>
              )}

              {pct !== null ? (
                <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                </div>
              ) : (
                <span className="text-[9px] text-muted-foreground uppercase tracking-wide">manual</span>
              )}

              <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                {skill.count > 0 && <span>{skill.count} repos</span>}
                {years !== null && years > 0 && (
                  <span className="opacity-70">· {years}a</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Repos panel */}
      {selected && (
        <div className="rounded-xl border bg-muted/30 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-background/50">
            <div className="flex items-center gap-3">
              <SkillIcon name={selected} />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{selected}</p>
                  {selectedSkill && selectedSkill.count > 0 && (
                    <span className={`text-[10px] font-semibold uppercase ${getMasteryLevel(selectedSkill.count).className}`}>
                      {getMasteryLevel(selectedSkill.count).label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {!selectedIsCustomOnly && filteredRepos.length > 0 && (
                    <span>{filteredRepos.length} repo{filteredRepos.length !== 1 ? "s" : ""}</span>
                  )}
                  {selectedSkill?.first_year && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      desde {selectedSkill.first_year}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              aria-label="Fechar"
              className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4">
            {loadingRepos ? (
              <div className="flex flex-col items-center justify-center gap-2 py-6">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-xs text-muted-foreground">Carregando repositórios...</span>
              </div>
            ) : selectedIsCustomOnly ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Habilidade adicionada manualmente — sem repositórios vinculados no GitHub.
              </p>
            ) : selectedIsFramework ? (
              <div className="text-center py-4 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Detectado por análise de{" "}
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">package.json</code>{" "}
                  / arquivos de dependências.
                </p>
                <a
                  href={`https://github.com/${username}?tab=repositories`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  Ver repositórios no GitHub
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ) : filteredRepos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredRepos.map((repo) => (
                  <a
                    key={repo.name}
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-2 p-3 rounded-lg bg-background border hover:border-foreground/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium group-hover:underline truncate">{repo.name}</p>
                      {repo.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{repo.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                        {repo.stargazers_count > 0 && (
                          <span>★ {repo.stargazers_count}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-2.5 w-2.5" />
                          {relativeDate(repo.pushed_at)}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum repositório público encontrado para {selected}.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
