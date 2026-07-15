import { Suspense } from "react";

import { OAuth2CallbackClient } from "./oauth2-callback-client";
import { AuthLoader } from "@/components/auth/auth-loader";

export default function OAuth2CallbackPage() {
  return (
    <Suspense fallback={<AuthLoader mode="oauth" />}>
      <OAuth2CallbackClient />
    </Suspense>
  );
}
