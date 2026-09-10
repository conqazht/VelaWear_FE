import { Suspense } from "react";
import { NotificationsClient } from "./notifications-client";

export default function NotificationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f4ef]" />}>
      <NotificationsClient />
    </Suspense>
  );
}
