import Link from "next/link";
import React from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { type ProfileTabId } from "./profile-formatters";

interface ProfileShellProps {
  activeTab: ProfileTabId;
  children: React.ReactNode;
}

export function ProfileShell({ activeTab, children }: ProfileShellProps) {
  const { t } = useI18n();

  const tabs: { id: ProfileTabId; label: string }[] = [
    { id: "profile", label: t("account.tabs.profile") },
    { id: "orders", label: t("account.tabs.orders") },
    { id: "favourites", label: t("account.tabs.favourites") },
    { id: "coupons", label: "Coupons" },
    { id: "reviews", label: "Reviews" },
  ];

  return (
    <div className="bg-canvas text-ink min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <div className="border-b border-hairline bg-canvas sticky top-0 z-10">
        <div className="w-full px-6 md:px-16 flex items-center justify-between h-14 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-8 min-w-max">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={`/profile?tab=${tab.id}`}
                  className={`text-xs uppercase tracking-[0.15em] font-medium transition-colors py-4 border-b-2 ${
                    isActive
                      ? "border-ink text-ink font-semibold"
                      : "border-transparent text-ink/60 hover:text-ink hover:border-hairline"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow w-full px-6 md:px-16 py-10 md:py-16 flex flex-col gap-10">
        {children}
      </main>
    </div>
  );
}
