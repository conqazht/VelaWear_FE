"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { exchangeOAuth2Code } from "@/lib/api/auth";

export function OAuth2CallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      router.replace("/sign-in?error=oauth2_login_failed");
      return;
    }

    const loginCode = code;
    let cancelled = false;

    async function completeLogin() {
      try {
        await exchangeOAuth2Code({ code: loginCode });
        if (!cancelled) {
          router.replace("/");
        }
      } catch {
        if (!cancelled) {
          router.replace("/sign-in?error=oauth2_login_failed");
        }
      }
    }

    void completeLogin();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <main className="grid min-h-dvh place-items-center bg-[#f6f0e8] px-6 text-center text-[#1c1a18]">
      <p className="text-sm font-medium uppercase tracking-wider">Completing Google login...</p>
    </main>
  );
}
