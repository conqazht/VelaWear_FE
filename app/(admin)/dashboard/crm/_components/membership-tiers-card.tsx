"use client";

import { Crown, ShieldCheck, Sparkles, User } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { MembershipTierSummary } from "@/lib/api/admin-dashboard";
import { formatNumber } from "@/lib/i18n/format";

type MembershipTiersCardProps = {
  tiers?: MembershipTierSummary[];
};

const TIER_META: Record<
  string,
  {
    icon: typeof User;
    badgeClass: string;
    indicatorClass: string;
    criteria: string;
  }
> = {
  STANDARD: {
    icon: User,
    badgeClass: "bg-muted text-muted-foreground border-border",
    indicatorClass: "*:data-[slot='progress-indicator']:bg-slate-400",
    criteria: "< 2M đ",
  },
  SILVER: {
    icon: ShieldCheck,
    badgeClass: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200",
    indicatorClass: "*:data-[slot='progress-indicator']:bg-slate-500",
    criteria: "≥ 2M đ",
  },
  GOLD: {
    icon: Sparkles,
    badgeClass: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200",
    indicatorClass: "*:data-[slot='progress-indicator']:bg-amber-500",
    criteria: "≥ 5M đ",
  },
  DIAMOND: {
    icon: Crown,
    badgeClass: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-200",
    indicatorClass: "*:data-[slot='progress-indicator']:bg-purple-500",
    criteria: "≥ 10M đ",
  },
};

export function MembershipTiersCard({ tiers = [] }: MembershipTiersCardProps) {
  const { locale } = useI18n();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-semibold text-base">
          {locale === "vi" ? "Phân hạng hội viên" : "Membership Tiers"}
        </CardTitle>
        <CardDescription className="text-xs">
          {locale === "vi"
            ? "Phân bổ khách hàng theo các hạng mức chi tiêu tích lũy"
            : "Distribution of customers across loyalty spend tiers"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tiers.length === 0 ? (
          <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
            {locale === "vi" ? "Chưa có dữ liệu hội viên" : "No membership tier data"}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {tiers.map((tier) => {
              const meta = TIER_META[tier.tier] ?? TIER_META.STANDARD;
              const Icon = meta.icon;

              return (
                <div key={tier.tier} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`gap-1 px-2 py-0.5 text-xs ${meta.badgeClass}`}>
                        <Icon className="size-3" />
                        <span>{tier.label}</span>
                      </Badge>
                      <span className="text-muted-foreground text-xs">{meta.criteria}</span>
                    </div>
                    <div className="flex items-center gap-2 tabular-nums">
                      <span className="font-semibold">{formatNumber(tier.count, locale)}</span>
                      <span className="text-muted-foreground text-xs">({tier.percentage}%)</span>
                    </div>
                  </div>
                  <Progress value={tier.percentage} className={`h-2 ${meta.indicatorClass}`} />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
