import Link from "next/link";
import React from "react";
import { motion } from "motion/react";
import { Shield } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { canAccessManagement } from "@/lib/auth/roles";
import { type ProfileTabId } from "./profile-formatters";

interface ProfileShellProps {
  activeTab: ProfileTabId;
  children: React.ReactNode;
}

export function ProfileShell({ activeTab, children }: ProfileShellProps) {
  const { t } = useI18n();
  const { user } = useAuth();

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
        <div className="w-full px-6 md:px-16 flex items-center justify-between h-14 overflow-x-auto no-scrollbar gap-4">
          <div className="flex items-center gap-8 min-w-max">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={`/profile?tab=${tab.id}`}
                  className={`relative text-xs uppercase tracking-[0.15em] font-medium transition-colors py-4 ${
                    isActive
                      ? "text-ink font-semibold"
                      : "text-ink/60 hover:text-ink"
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="profile-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-ink"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {canAccessManagement(user) && (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#1c1a18] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-[#8f2f20] transition-colors flex-shrink-0"
            >
              <Shield className="size-3.5 text-[#e2a898]" />
              <span>{t("common.adminDashboard")}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow w-full px-6 md:px-16 py-10 md:py-16 flex flex-col gap-10">
        {children}
      </main>
    </div>
  );
}
