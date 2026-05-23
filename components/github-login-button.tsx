"use client";

import { useState } from "react";
import { GitHubIcon } from "@/components/icons/github";
import { Button } from "@/components/ui/button";
import { createBrowserClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export function GitHubLoginButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const supabase = createBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        scopes: "read:user public_repo",
      },
    });
    // loading stays true — page will navigate away
  }

  return (
    <Button onClick={handleLogin} disabled={loading} size="lg" className="w-full gap-2">
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <GitHubIcon className="h-5 w-5" />
      )}
      {loading ? "Redirecionando..." : "Continuar com GitHub"}
    </Button>
  );
}
