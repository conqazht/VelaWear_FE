"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { exchangeOAuth2Code } from "@/lib/api/auth";
import { AuthLoader } from "@/components/auth/auth-loader";

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

  return <AuthLoader message="Đang hoàn tất đăng nhập..." />;
}
