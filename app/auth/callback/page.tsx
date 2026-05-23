"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

function AuthSpinner({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center flex-col gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const supabase = createBrowserClient();

    if (code) {
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ error }) => router.push(error ? "/login" : "/dashboard"));
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        subscription.unsubscribe();
        router.push("/dashboard");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        subscription.unsubscribe();
        router.push("/dashboard");
      }
    });

    const timeout = setTimeout(() => {
      subscription.unsubscribe();
      router.push("/login");
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router, searchParams]);

  return <AuthSpinner message="Autenticando com GitHub..." />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthSpinner message="Carregando..." />}>
      <CallbackHandler />
    </Suspense>
  );
}
