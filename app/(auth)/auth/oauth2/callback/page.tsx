import { Suspense } from "react";

import { OAuth2CallbackClient } from "./oauth2-callback-client";

export default function OAuth2CallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-dvh place-items-center bg-[#f6f0e8] px-6 text-center text-[#1c1a18]">
          <p className="text-sm font-medium uppercase tracking-wider">Completing Google login...</p>
        </main>
      }
    >
      <OAuth2CallbackClient />
    </Suspense>
  );
}
