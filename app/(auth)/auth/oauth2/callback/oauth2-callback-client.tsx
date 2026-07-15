"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { exchangeOAuth2Code, getMe } from "@/lib/api/auth";
import { AuthLoader } from "@/components/auth/auth-loader";
import {
  clearPostAuthRedirect,
  createSignInHref,
  getStoredPostAuthRedirect,
} from "@/lib/auth/post-auth-redirect";
import { getPostSignInPath, getRoleSessionLabel } from "@/lib/auth/roles";
import { queryKeys } from "@/lib/queries/keys";
import { useI18n } from "@/components/providers/i18n-provider";
import { getAuthRoleMessageKey } from "@/lib/i18n/messages/auth-errors";

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
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [sessionRoleLabel, setSessionRoleLabel] = useState<string | null>(null);

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
        if (cancelled) return;

        const profile = await getMe();
        if (cancelled) return;

        queryClient.setQueryData(queryKeys.auth.session, profile);
        setSessionRoleLabel(getRoleSessionLabel(profile));
        clearPostAuthRedirect();
        router.replace(redirectTo ?? getPostSignInPath(profile));
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
  }, [queryClient, router, searchParams]);

  return (
    <AuthLoader
      message={
        sessionRoleLabel
          ? t("auth.common.checkingSession", {
              role: t(getAuthRoleMessageKey(sessionRoleLabel)),
            })
          : t("auth.oauth.completing")
      }
      mode="oauth"
    />
  );
}
