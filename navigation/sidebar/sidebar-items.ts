import {
  Banknote,
  BadgePercent,
  Calendar,
  ChartBar,
  CheckSquare,
  ClipboardList,
  FolderTree,
  Gauge,
  Kanban,
  KeyRound,
  LayoutDashboard,
  ListTodo,
  Lock,
  type LucideIcon,
  Mail,
  MessageSquare,
  Package,
  Palette,
  ReceiptText,
  Server,
  ShoppingBag,
  TicketPercent,
  Tags,
  Users,
} from "lucide-react";

export type NavBadge = "new" | "soon";

export interface NavSubItem {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

interface NavItemBase {
  id: string;
  title: string;
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
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Management",
    items: [
      {
        id: "users",
        title: "Users",
        url: "/dashboard/users",
        icon: Users,
      },
      {
        id: "roles",
        title: "Roles",
        url: "/dashboard/roles",
        icon: Lock,
      },
      {
        id: "permissions",
        title: "Permissions",
        url: "/dashboard/permissions",
        icon: KeyRound,
      },
      {
        id: "products",
        title: "Products",
        url: "/dashboard/products",
        icon: Package,
      },
      {
        id: "categories",
        title: "Categories",
        url: "/dashboard/categories",
        icon: FolderTree,
      },
      {
        id: "brands",
        title: "Brands",
        url: "/dashboard/brands",
        icon: Tags,
      },
      {
        id: "attributes",
        title: "Colors & Sizes",
        url: "/dashboard/attributes",
        icon: Palette,
      },
      {
        id: "orders",
        title: "Orders",
        url: "/dashboard/orders",
        icon: ClipboardList,
      },
      {
        id: "sales",
        title: "Sale Campaigns",
        url: "/dashboard/sales",
        icon: BadgePercent,
      },
      {
        id: "coupons",
        title: "Coupons",
        url: "/dashboard/coupons",
        icon: TicketPercent,
      },
    ],
  },
  {
    id: 2,
    label: "Dashboards",
    items: [
      {
        id: "default",
        title: "Default",
        url: "/dashboard/default",
        icon: LayoutDashboard,
      },
      {
        id: "crm",
        title: "CRM",
        url: "/dashboard/crm",
        icon: ChartBar,
      },
      {
        id: "finance",
        title: "Finance",
        url: "/dashboard/finance",
        icon: Banknote,
      },
      {
        id: "analytics",
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: Gauge,
      },
      {
        id: "productivity",
        title: "Productivity",
        url: "/dashboard/productivity",
        icon: ListTodo,
      },
      {
        id: "ecommerce",
        title: "E-commerce",
        url: "/dashboard/ecommerce",
        icon: ShoppingBag,
      },
      {
        id: "infrastructure",
        title: "Infrastructure",
        url: "/dashboard/infrastructure",
        icon: Server,
        badge: "new",
      },
    ],
  },
  {
    id: 3,
    label: "Pages",
    items: [
      {
        id: "email",
        title: "Email",
        url: "/dashboard/mail",
        icon: Mail,
      },
      {
        id: "chat",
        title: "Chat",
        url: "/dashboard/chat",
        icon: MessageSquare,
      },
      {
        id: "calendar",
        title: "Calendar",
        url: "/dashboard/calendar",
        icon: Calendar,
      },
      {
        id: "kanban",
        title: "Kanban",
        url: "/dashboard/kanban",
        icon: Kanban,
      },
      {
        id: "tasks",
        title: "Tasks",
        url: "/dashboard/tasks",
        icon: CheckSquare,
        badge: "new",
      },
      {
        id: "invoice",
        title: "Invoice",
        url: "/dashboard/invoice",
        icon: ReceiptText,
      },
    ],
  },
];
