"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const supabase = createBrowserClient();

    if (code) {
      // PKCE flow: exchange code for session
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ error }) => router.push(error ? "/login" : "/dashboard"));
      return;
    }

    // Implicit flow: Supabase processes the hash fragment automatically on init.
    // onAuthStateChange fires with SIGNED_IN once the token is parsed.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        subscription.unsubscribe();
        router.push("/dashboard");
      }
    });

    // Fallback: if SIGNED_IN already fired before listener attached, check directly.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        subscription.unsubscribe();
        router.push("/dashboard");
      }
    });

    // Safety timeout: if nothing fires in 5s, send to login.
    const timeout = setTimeout(() => {
      subscription.unsubscribe();
      router.push("/login");
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground text-sm">Autenticando...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground text-sm">Autenticando...</p>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
