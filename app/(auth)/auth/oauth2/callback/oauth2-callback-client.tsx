"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { exchangeOAuth2Code } from "@/lib/api/auth";
import { AuthLoader } from "@/components/auth/auth-loader";
import {
  clearPostAuthRedirect,
  createSignInHref,
  getStoredPostAuthRedirect,
} from "@/lib/auth/post-auth-redirect";

let activeOAuthExchange: {
  code: string;
  promise: ReturnType<typeof exchangeOAuth2Code>;
} | null = null;

function exchangeOAuth2CodeOnce(code: string) {
  if (activeOAuthExchange?.code === code) return activeOAuthExchange.promise;

  const promise = exchangeOAuth2Code({ code });
  activeOAuthExchange = { code, promise };
  const clearActiveExchange = () => {
    if (activeOAuthExchange?.promise === promise) activeOAuthExchange = null;
  };
  void promise.then(clearActiveExchange, clearActiveExchange);
  return promise;
}

export function OAuth2CallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const redirectTo = getStoredPostAuthRedirect();
    if (!code) {
      const signInHref = createSignInHref(redirectTo);
      router.replace(`${signInHref}${signInHref.includes("?") ? "&" : "?"}error=oauth2_login_failed`);
      return;
    }

    const loginCode = code;
    let cancelled = false;

    async function completeLogin() {
      try {
        await exchangeOAuth2CodeOnce(loginCode);
        if (!cancelled) {
          clearPostAuthRedirect();
          router.replace(redirectTo ?? "/");
        }
      } catch {
        if (!cancelled) {
          clearPostAuthRedirect();
          const signInHref = createSignInHref(redirectTo);
          router.replace(`${signInHref}${signInHref.includes("?") ? "&" : "?"}error=oauth2_login_failed`);
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
