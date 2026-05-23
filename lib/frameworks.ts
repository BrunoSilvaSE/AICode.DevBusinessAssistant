// Maps package/module names to display names shown in Skill Tree
const NPM_FRAMEWORK_MAP: Record<string, string> = {
  react: "React",
  "react-dom": "React",
  next: "Next.js",
  vue: "Vue.js",
  nuxt: "Nuxt.js",
  "@angular/core": "Angular",
  svelte: "Svelte",
  "@sveltejs/kit": "SvelteKit",
  express: "Express",
  "@nestjs/core": "NestJS",
  fastify: "Fastify",
  hono: "Hono",
  koa: "Koa",
  prisma: "Prisma",
  drizzle: "Drizzle",
  "@supabase/supabase-js": "Supabase",
  "firebase-admin": "Firebase",
  mongoose: "MongoDB",
  "@tanstack/react-query": "React Query",
  "react-router-dom": "React Router",
  redux: "Redux",
  zustand: "Zustand",
  tailwindcss: "Tailwind CSS",
  vitest: "Vitest",
  jest: "Jest",
  graphql: "GraphQL",
  "apollo-server": "Apollo",
  "socket.io": "Socket.io",
  "bull": "BullMQ",
  bullmq: "BullMQ",
  trpc: "tRPC",
  "@trpc/server": "tRPC",
  axios: "Axios",
  zod: "Zod",
  stripe: "Stripe",
};

const PYTHON_FRAMEWORK_MAP: Record<string, string> = {
  fastapi: "FastAPI",
  django: "Django",
  flask: "Flask",
  starlette: "Starlette",
  sqlalchemy: "SQLAlchemy",
  pandas: "Pandas",
  numpy: "NumPy",
  torch: "PyTorch",
  tensorflow: "TensorFlow",
  sklearn: "scikit-learn",
  "scikit-learn": "scikit-learn",
  celery: "Celery",
  pydantic: "Pydantic",
  alembic: "Alembic",
  uvicorn: "Uvicorn",
  pytest: "Pytest",
  langchain: "LangChain",
  openai: "OpenAI SDK",
};

const GO_FRAMEWORK_MAP: Record<string, string> = {
  "github.com/gin-gonic/gin": "Gin",
  "github.com/labstack/echo": "Echo",
  "github.com/gofiber/fiber": "Fiber",
  "github.com/go-chi/chi": "Chi",
  "gorm.io/gorm": "GORM",
  "github.com/jmoiron/sqlx": "sqlx",
};

const RUST_FRAMEWORK_MAP: Record<string, string> = {
  "actix-web": "Actix Web",
  axum: "Axum",
  tokio: "Tokio",
  serde: "Serde",
  sqlx: "SQLx",
  "sea-orm": "SeaORM",
};

type GithubRepo = {
  name: string;
  full_name: string;
  language: string | null;
  default_branch?: string;
};

async function fetchFileContent(
  fullName: string,
  path: string,
  headers: Record<string, string>
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${fullName}/contents/${path}`,
      { headers }
    );
    if (!res.ok) return null;
    const data = await res.json() as { content?: string; encoding?: string };
    if (data.content && data.encoding === "base64") {
      return atob(data.content.replace(/\n/g, ""));
    }
    return null;
  } catch {
    return null;
  }
}

function parseNpmDeps(content: string): string[] {
  try {
    const pkg = JSON.parse(content) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    return [
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.devDependencies ?? {}),
    ];
  } catch {
    return [];
  }
}

function parsePythonDeps(content: string): string[] {
  return content
    .split("\n")
    .map((l) => l.trim().split(/[>=<!=\[;]/)[0].trim().toLowerCase())
    .filter(Boolean);
}

function parseGoMod(content: string): string[] {
  return content
    .split("\n")
    .map((l) => l.trim().split(" ")[0])
    .filter((l) => l.startsWith("github.com/") || l.includes(".io/"));
}

function parseCargoToml(content: string): string[] {
  const deps: string[] = [];
  let inDeps = false;
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "[dependencies]" || trimmed === "[dev-dependencies]") {
      inDeps = true;
      continue;
    }
    if (trimmed.startsWith("[")) { inDeps = false; continue; }
    if (inDeps && trimmed.includes("=")) {
      deps.push(trimmed.split("=")[0].trim());
    }
  }
  return deps;
}

function mapToFrameworks(
  deps: string[],
  map: Record<string, string>
): string[] {
  const found = new Set<string>();
  for (const dep of deps) {
    const name = map[dep];
    if (name) found.add(name);
  }
  return [...found];
}

export async function detectFrameworks(
  repos: GithubRepo[],
  githubToken: string
): Promise<Record<string, number>> {
  const headers = {
    Authorization: `token ${githubToken}`,
    Accept: "application/vnd.github+json",
  };

  // Limit to 25 most-recently-updated repos to stay within rate limits
  const targets = repos.slice(0, 25);
  const counts: Record<string, number> = {};

  function inc(name: string) {
    counts[name] = (counts[name] ?? 0) + 1;
  }

  await Promise.all(
    targets.map(async (repo) => {
      const lang = repo.language;

      // Track docker regardless of language
      const dockerFile = await fetchFileContent(repo.full_name, "Dockerfile", headers);
      if (dockerFile) inc("Docker");

      if (lang === "JavaScript" || lang === "TypeScript") {
        const content = await fetchFileContent(repo.full_name, "package.json", headers);
        if (content) {
          const deps = parseNpmDeps(content);
          mapToFrameworks(deps, NPM_FRAMEWORK_MAP).forEach(inc);
        }
      } else if (lang === "Python") {
        const content = await fetchFileContent(repo.full_name, "requirements.txt", headers);
        if (content) {
          const deps = parsePythonDeps(content);
          mapToFrameworks(deps, PYTHON_FRAMEWORK_MAP).forEach(inc);
        }
      } else if (lang === "Go") {
        const content = await fetchFileContent(repo.full_name, "go.mod", headers);
        if (content) {
          const deps = parseGoMod(content);
          mapToFrameworks(deps, GO_FRAMEWORK_MAP).forEach(inc);
        }
      } else if (lang === "Rust") {
        const content = await fetchFileContent(repo.full_name, "Cargo.toml", headers);
        if (content) {
          const deps = parseCargoToml(content);
          mapToFrameworks(deps, RUST_FRAMEWORK_MAP).forEach(inc);
        }
      }
    })
  );

  return counts;
}
