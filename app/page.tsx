import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/icons/github";
import {
  Zap, Users, TrendingUp, GitBranch, Sparkles, BarChart2, ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <span className="font-bold text-sm tracking-tight">Dev Business Assistant</span>
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Entrar</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          {/* Glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-5xl mx-auto px-6 py-28 sm:py-36 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-slate-300 mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              GitHub para marca pessoal
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight max-w-3xl mx-auto">
              A vitrine que seu{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                GitHub Profile
              </span>{" "}
              deveria ser
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-xl mx-auto leading-relaxed">
              Transforme seus repositórios em portfólio dinâmico, posts para o
              LinkedIn e Skill Tree verificável — tudo com IA.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="gap-2 text-base h-12 px-8">
                <Link href="/login">
                  <GitHubIcon className="h-5 w-5" />
                  Entrar com GitHub
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 text-base h-12 px-8 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">
                <a href="#como-funciona">
                  Ver como funciona
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>

            {/* Social proof */}
            <p className="mt-8 text-xs text-slate-500">
              Login apenas com GitHub · Sem senha · Repositórios públicos
            </p>
          </div>
        </section>

        {/* How it works */}
        <section id="como-funciona" className="py-20 sm:py-28 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Como funciona</p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Três passos, portfólio pronto</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {STEPS.map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {i + 1}
                  </div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 sm:py-28 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Funcionalidades</p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Tudo que você precisa para se destacar</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((f, i) => (
                <FeatureCard key={i} icon={f.icon} title={f.title} description={f.description} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white text-center">
          <div className="max-w-xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Seu portfólio em minutos
            </h2>
            <p className="text-slate-300">
              Login com GitHub, IA sincroniza seus repos. Sem configuração manual.
            </p>
            <Button asChild size="lg" className="gap-2 h-12 px-8 text-base">
              <Link href="/login">
                <GitHubIcon className="h-5 w-5" />
                Começar agora — é gratuito
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Dev Business Assistant — trabalho acadêmico · IA para não programadores
      </footer>
    </div>
  );
}

const STEPS = [
  {
    title: "Conecte seu GitHub",
    desc: "Login em um clique. A IA sincroniza automaticamente seus repositórios públicos.",
  },
  {
    title: "IA analisa seu código",
    desc: "Skills detectadas de package.json, go.mod, requirements.txt e muito mais.",
  },
  {
    title: "Compartilhe seu portfólio",
    desc: "URL pública /u/seu-usuario com portfólio completo, pronto para recruiters.",
  },
];

const FEATURES = [
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Portfólio público",
    description: "Hero, Skill Tree, linha do tempo, projetos e formulário de contato em /u/seu-usuario.",
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,
    title: "Post LinkedIn em 1 clique",
    description: "IA traduz trabalho técnico em linguagem de negócio ou técnica. Compartilhe direto no LinkedIn.",
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: "Skill Tree verificável",
    description: "Skills inferidas do código real. Clique em uma skill e veja os repos que a comprovam.",
  },
  {
    icon: <GitBranch className="h-5 w-5" />,
    title: "Diagrama de Arquitetura",
    description: "IA gera diagrama Mermaid de qualquer repo e salva no portfólio público.",
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "Bio e README por IA",
    description: "Bio profissional e README completo gerados a partir do contexto real dos seus projetos.",
  },
  {
    icon: <BarChart2 className="h-5 w-5" />,
    title: "Análise de Perfil",
    description: "Score 0–100, pontos fortes, melhorias e dica de ação para potencializar sua presença.",
  },
];

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group flex flex-col gap-3 text-left p-5 rounded-xl border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200">
      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/15 transition-colors">
        {icon}
      </div>
      <h3 className="font-semibold text-sm">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
