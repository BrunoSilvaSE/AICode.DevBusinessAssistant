import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/icons/github";
import { Zap, Users, TrendingUp } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-semibold text-sm tracking-tight">
            Dev Business Assistant
          </span>
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Entrar</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="max-w-2xl space-y-6">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
            GitHub para marca pessoal
          </p>
          <h1 className="text-5xl font-bold tracking-tight leading-tight">
            A vitrine que seu{" "}
            <span className="text-primary">GitHub Profile</span> deveria ser
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Transforme seus repositórios em portfólio dinâmico, posts para o
            LinkedIn e uma Skill Tree verificável — tudo com IA.
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/login">
                <GitHubIcon className="mr-2 h-5 w-5" />
                Entrar com GitHub
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full">
          <FeatureCard
            icon={<Zap className="h-5 w-5" />}
            title="Portfólio público"
            description="URL pública /u/seu-usuario com hero, Skill Tree, linha do tempo e posts gerados."
          />
          <FeatureCard
            icon={<TrendingUp className="h-5 w-5" />}
            title="Post LinkedIn em 1 clique"
            description="IA traduz seu trabalho técnico em linguagem de negócio ou técnica para o LinkedIn."
          />
          <FeatureCard
            icon={<Users className="h-5 w-5" />}
            title="Skill Tree verificável"
            description="Skills inferidas do seu código real — não auto-declaração."
          />
          <FeatureCard
            icon={<Zap className="h-5 w-5" />}
            title="Linha do Tempo"
            description="Adicione formação, bootcamps e experiências. Vincule repositórios open source."
          />
          <FeatureCard
            icon={<TrendingUp className="h-5 w-5" />}
            title="Auto-README"
            description="IA gera um README.md profissional para qualquer repositório em segundos."
          />
          <FeatureCard
            icon={<Users className="h-5 w-5" />}
            title="Repos em Destaque"
            description="Escolha até 3 projetos para aparecer no topo do seu portfólio público."
          />
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Dev Business Assistant — trabalho acadêmico (IA para não programadores)
      </footer>
    </div>
  );
}

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
    <div className="flex flex-col gap-2 text-left p-4 rounded-lg border bg-card">
      <div className="text-primary">{icon}</div>
      <h3 className="font-semibold text-sm">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
