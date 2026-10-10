import { Suspense } from "react";
import { NotificationsClient } from "./_components/notifications-client";

export default function NotificationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f4ef] pt-[104px] md:pt-[124px]" />}>
      <NotificationsClient />
    </Suspense>
  );
}
