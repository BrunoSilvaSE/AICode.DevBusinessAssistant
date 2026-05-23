import { GitHubLoginButton } from "@/components/github-login-button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm space-y-8">
        {/* Back link */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Início
        </Link>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Dev Business Assistant</h1>
          <p className="text-sm text-muted-foreground">
            Seu portfólio dinâmico, gerado a partir do seu código real.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-7 space-y-5 shadow-sm">
          <GitHubLoginButton />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">acesso seguro</span>
            </div>
          </div>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
              Apenas repositórios públicos
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
              Sem senha — login via GitHub OAuth
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
              Dados usados apenas para gerar seu portfólio
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
