import {
  BadgePercent,
  Banknote,
  ChartBar,
  ClipboardList,
  FolderTree,
  Gauge,
  KeyRound,
  Lock,
  type LucideIcon,
  MessageSquare,
  Package,
  Palette,
  ReceiptText,
  ShoppingBag,
  Tags,
  TicketPercent,
  Users,
} from "lucide-react";

import type { AdminShellTranslationKey } from "@/lib/i18n/messages/admin-shell";

export type NavBadge = "new" | "soon";

export interface NavSubItem {
  id: string;
  titleKey: AdminShellTranslationKey;
  url: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

interface NavItemBase {
  id: string;
  titleKey: AdminShellTranslationKey;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

export interface NavMainLinkItem extends NavItemBase {
  url: string;
  subItems?: never;
}

export interface NavMainParentItem extends NavItemBase {
  subItems: NavSubItem[];
}

export type NavMainItem = NavMainLinkItem | NavMainParentItem;

export interface NavGroup {
  id: number;
  labelKey?: AdminShellTranslationKey;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    labelKey: "admin.shell.navigation.dashboards",
    items: [
      {
        id: "ecommerce",
        titleKey: "admin.shell.navigation.ecommerce",
        url: "/dashboard/ecommerce",
        icon: ShoppingBag,
      },
      {
        id: "analytics",
        titleKey: "admin.shell.navigation.analytics",
        url: "/dashboard/analytics",
        icon: Gauge,
      },
      {
        id: "finance",
        titleKey: "admin.shell.navigation.finance",
        url: "/dashboard/finance",
        icon: Banknote,
      },
      {
        id: "crm",
        titleKey: "admin.shell.navigation.crm",
        url: "/dashboard/crm",
        icon: ChartBar,
      },
      /* Non-core template items commented out for fashion e-commerce focus:
      {
        id: "default",
        titleKey: "admin.shell.navigation.default",
        url: "/dashboard/default",
        icon: LayoutDashboard,
      },
      {
        id: "productivity",
        titleKey: "admin.shell.navigation.productivity",
        url: "/dashboard/productivity",
        icon: ListTodo,
      },
      {
        id: "infrastructure",
        titleKey: "admin.shell.navigation.infrastructure",
        url: "/dashboard/infrastructure",
        icon: Server,
        badge: "new",
      },
      */
    ],
  },
  {
    id: 2,
    labelKey: "admin.shell.navigation.management",
    items: [
      {
        id: "products",
        titleKey: "admin.shell.navigation.products",
        url: "/dashboard/products",
        icon: Package,
      },
      {
        id: "categories",
        titleKey: "admin.shell.navigation.categories",
        url: "/dashboard/categories",
        icon: FolderTree,
      },
      {
        id: "brands",
        titleKey: "admin.shell.navigation.brands",
        url: "/dashboard/brands",
        icon: Tags,
      },
      {
        id: "attributes",
        titleKey: "admin.shell.navigation.attributes",
        url: "/dashboard/attributes",
        icon: Palette,
      },
      {
        id: "orders",
        titleKey: "admin.shell.navigation.orders",
        url: "/dashboard/orders",
        icon: ClipboardList,
      },
      {
        id: "sales",
        titleKey: "admin.shell.navigation.sales",
        url: "/dashboard/sales",
        icon: BadgePercent,
      },
      {
        id: "coupons",
        titleKey: "admin.shell.navigation.coupons",
        url: "/dashboard/coupons",
        icon: TicketPercent,
      },
      {
        id: "users",
        titleKey: "admin.shell.navigation.users",
        url: "/dashboard/users",
        icon: Users,
      },
      {
        id: "roles",
        titleKey: "admin.shell.navigation.roles",
        url: "/dashboard/roles",
        icon: Lock,
      },
      {
        id: "permissions",
        titleKey: "admin.shell.navigation.permissions",
        url: "/dashboard/permissions",
        icon: KeyRound,
      },
    ],
  },
  {
    id: 3,
    labelKey: "admin.shell.navigation.tools",
    items: [
      {
        id: "invoice",
        titleKey: "admin.shell.navigation.invoice",
        url: "/dashboard/invoice",
        icon: ReceiptText,
      },
      {
        id: "chat",
        titleKey: "admin.shell.navigation.chat",
        url: "/dashboard/chat",
        icon: MessageSquare,
      },
      /* Non-core template items commented out for fashion e-commerce focus:
      {
        id: "email",
        titleKey: "admin.shell.navigation.email",
        url: "/dashboard/mail",
        icon: Mail,
      },
      {
        id: "calendar",
        titleKey: "admin.shell.navigation.calendar",
        url: "/dashboard/calendar",
        icon: Calendar,
      },
      {
        id: "kanban",
        titleKey: "admin.shell.navigation.kanban",
        url: "/dashboard/kanban",
        icon: Kanban,
      },
      {
        id: "tasks",
        titleKey: "admin.shell.navigation.tasks",
        url: "/dashboard/tasks",
        icon: CheckSquare,
        badge: "new",
      },
      */
    ],
  },
];
