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
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ error }) => router.push(error ? "/login" : "/dashboard"));
    } else {
      supabase.auth
        .getSession()
        .then(({ data: { session } }) =>
          router.push(session ? "/dashboard" : "/login")
        );
    }
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
