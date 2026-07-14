"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { exchangeOAuth2Code, getMe } from "@/lib/api/auth";
import { AuthLoader } from "@/components/auth/auth-loader";
import { getPostSignInPath, getRoleSessionLabel } from "@/lib/auth/roles";
import { queryKeys } from "@/lib/queries/keys";

export function OAuth2CallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [sessionRoleLabel, setSessionRoleLabel] = useState<string | null>(null);

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
        const profile = await getMe();
        if (cancelled) return;

        queryClient.setQueryData(queryKeys.auth.session, profile);
        setSessionRoleLabel(getRoleSessionLabel(profile));
        router.replace(getPostSignInPath(profile));
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
  }, [queryClient, router, searchParams]);

  return (
    <AuthLoader
      message={
        sessionRoleLabel
          ? `Checking ${sessionRoleLabel} session...`
          : "Đang hoàn tất đăng nhập..."
      }
    />
  );
}
