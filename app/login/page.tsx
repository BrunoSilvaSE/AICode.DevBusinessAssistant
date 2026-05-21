import { GitHubLoginButton } from "@/components/github-login-button";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Dev Business Assistant
          </h1>
          <p className="text-sm text-muted-foreground">
            Seu portfólio dinâmico, gerado a partir do seu código real.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-4">
          <GitHubLoginButton />
          <p className="text-xs text-center text-muted-foreground">
            Ao entrar você concorda com os termos de uso. Solicitamos apenas
            acesso a repositórios públicos.
          </p>
        </div>
      </div>
    </div>
  );
}
