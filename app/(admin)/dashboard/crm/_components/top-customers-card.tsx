"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Crown, Download, ExternalLink, Search, ShieldCheck, Sparkles, User } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TopCustomerSummary } from "@/lib/api/admin-dashboard";
import { formatCurrency, formatDate, formatNumber } from "@/lib/i18n/format";
import { downloadCsv } from "@/app/(admin)/dashboard/_components/management/resource-utils";

type TopCustomersCardProps = {
  customers?: TopCustomerSummary[];
};

const TIER_BADGES: Record<string, { icon: typeof User; badgeClass: string }> = {
  STANDARD: {
    icon: User,
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
  SILVER: {
    icon: ShieldCheck,
    badgeClass:
      "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200",
  },
  GOLD: {
    icon: Sparkles,
    badgeClass:
      "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200",
  },
  DIAMOND: {
    icon: Crown,
    badgeClass:
      "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-200",
  },
};

export function TopCustomersCard({ customers = [] }: TopCustomersCardProps) {
  const { locale } = useI18n();
  const [search, setSearch] = useState("");

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const query = search.toLowerCase();
    return customers.filter(
      (c) =>
        (c.fullName && c.fullName.toLowerCase().includes(query)) ||
        (c.email && c.email.toLowerCase().includes(query)) ||
        (c.phone && c.phone.includes(query)),
    );
  }, [customers, search]);

  const handleExportCsv = () => {
    if (customers.length === 0) return;

    const rows = customers.map((c) => ({
      [locale === "vi" ? "Mã KH" : "User ID"]: c.userId,
      [locale === "vi" ? "Họ tên" : "Full Name"]: c.fullName,
      [locale === "vi" ? "Email" : "Email"]: c.email,
      [locale === "vi" ? "SĐT" : "Phone"]: c.phone,
      [locale === "vi" ? "Hạng" : "Tier"]: c.tierLabel,
      [locale === "vi" ? "Tổng đơn" : "Total Orders"]: c.totalOrders,
      [locale === "vi" ? "Tổng chi tiêu" : "Total Spent"]: c.totalSpent,
      [locale === "vi" ? "Đơn gần nhất" : "Last Order"]: c.lastOrderDate,
    }));

    downloadCsv(`top-customers-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              {locale === "vi" ? "Top khách hàng thân thiết (VIP)" : "Top Spending Customers"}
            </CardTitle>
            <CardDescription className="text-xs">
              {locale === "vi"
                ? "Danh sách khách hàng có tích lũy chi tiêu cao nhất"
                : "Top customers ranked by cumulative total spend"}
            </CardDescription>
          </div>

          <CardAction>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
                <Input
                  className="h-8 w-44 pl-8 text-xs sm:w-56"
                  placeholder={
                    locale === "vi" ? "Tìm theo tên, email, SĐT..." : "Search customer..."
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={handleExportCsv}
                disabled={customers.length === 0}
              >
                <Download className="mr-1.5 size-3.5" />
                {locale === "vi" ? "Xuất CSV" : "Export"}
              </Button>
            </div>
          </CardAction>
        </div>
      </CardHeader>

      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="w-12 text-center text-xs">#</TableHead>
                <TableHead className="text-xs">
                  {locale === "vi" ? "Khách hàng" : "Customer"}
                </TableHead>
                <TableHead className="text-xs">
                  {locale === "vi" ? "Số điện thoại" : "Phone"}
                </TableHead>
                <TableHead className="text-xs">
                  {locale === "vi" ? "Hạng hội viên" : "Tier"}
                </TableHead>
                <TableHead className="text-right text-xs">
                  {locale === "vi" ? "Tổng đơn" : "Orders"}
                </TableHead>
                <TableHead className="text-right text-xs">
                  {locale === "vi" ? "Tổng chi tiêu" : "Total Spent"}
                </TableHead>
                <TableHead className="text-right text-xs">
                  {locale === "vi" ? "Đơn gần nhất" : "Last Order"}
                </TableHead>
                <TableHead className="w-16 text-center text-xs"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground h-28 text-center text-sm">
                    {locale === "vi"
                      ? "Không có dữ liệu khách hàng phù hợp"
                      : "No matching customers"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer, index) => {
                  const meta = TIER_BADGES[customer.membershipTier] ?? TIER_BADGES.STANDARD;
                  const Icon = meta.icon;

                  return (
                    <TableRow key={customer.userId} className="border-border hover:bg-muted/40">
                      <TableCell className="text-muted-foreground text-center text-xs font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{customer.fullName}</span>
                          <span className="text-muted-foreground text-xs">
                            {customer.email || "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {customer.phone || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`gap-1 px-2 py-0.5 text-xs ${meta.badgeClass}`}
                        >
                          <Icon className="size-3" />
                          <span>{customer.tierLabel}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium tabular-nums">
                        {formatNumber(customer.totalOrders, locale)}
                      </TableCell>
                      <TableCell className="text-foreground text-right text-sm font-semibold tabular-nums">
                        {formatCurrency(customer.totalSpent, locale)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-right text-xs">
                        {customer.lastOrderDate ? formatDate(customer.lastOrderDate, locale) : "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          render={
                            <Link
                              href={`/dashboard/orders?search=${encodeURIComponent(customer.email || customer.fullName)}`}
                              title={locale === "vi" ? "Xem đơn hàng của khách" : "View orders"}
                            />
                          }
                        >
                          <ExternalLink className="text-muted-foreground hover:text-foreground size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
