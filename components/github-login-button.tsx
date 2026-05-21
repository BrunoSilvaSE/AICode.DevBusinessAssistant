"use client";

import { GitHubIcon } from "@/components/icons/github";
import { Button } from "@/components/ui/button";
import { createBrowserClient } from "@/lib/supabase/client";

export function GitHubLoginButton() {
  async function handleLogin() {
    const supabase = createBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        scopes: "read:user public_repo",
      },
    });
  }

  return (
    <Button onClick={handleLogin} size="lg" className="w-full gap-2">
      <GitHubIcon className="h-5 w-5" />
      Continuar com GitHub
    </Button>
  );
}
