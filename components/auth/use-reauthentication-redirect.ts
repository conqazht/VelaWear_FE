"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";

const SIGN_IN_PATH = "/sign-in";

export function useReauthenticationRedirect() {
  const { clearRevokedSession } = useAuth();
  const router = useRouter();

  return useCallback(async () => {
    try {
      await clearRevokedSession();
    } finally {
      // Thay đổi nhạy cảm đã thành công ở backend, nên luôn rời màn hình đang
      // giữ dữ liệu phiên cũ kể cả khi thao tác dọn query cache gặp lỗi hiếm.
      router.replace(SIGN_IN_PATH);
    }
  }, [clearRevokedSession, router]);
}
