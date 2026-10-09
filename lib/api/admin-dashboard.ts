import { apiGet } from "./client";

export type AdminDashboardPeriod = "this-month" | "last-month" | "last-30-days" | "year-to-date";

export type DashboardKpiSummary = {
  grossSales: number;
  grossSalesChangePercentage: number;
  totalOrders: number;
  totalOrdersChangePercentage: number;
  averageOrderValue: number;
  aovChangePercentage: number;
  cancellationsCount: number;
  cancellationRate: number;
};

export type RevenueChartPoint = {
  date: string;
  revenue: number;
  orderCount: number;
};

export type RecentOrderSummary = {
  id: number;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
};

export type TopProductSummary = {
  productName: string;
  productSlug: string | null;
  image: string | null;
  soldQuantity: number;
  totalRevenue: number;
};

export type InventorySummary = {
  totalVariants: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
};

export type RecentReviewSummary = {
  id: number;
  customerName: string;
  productName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

export type CustomerReviewSummary = {
  averageRating: number;
  totalReviews: number;
  recentReviews: RecentReviewSummary[];
};

export type EcommerceDashboardResponse = {
  period: AdminDashboardPeriod;
  kpis: DashboardKpiSummary;
  revenueChart: RevenueChartPoint[];
  recentOrders: RecentOrderSummary[];
  topProducts: TopProductSummary[];
  inventory: InventorySummary;
  customerReviews: CustomerReviewSummary;
};

export async function getAdminEcommerceDashboard(
  period: AdminDashboardPeriod = "this-month",
): Promise<EcommerceDashboardResponse> {
  return apiGet<EcommerceDashboardResponse>(`/admin/dashboard/ecommerce?period=${period}`);
}

export type FinanceKpiSummary = {
  netCollectedRevenue: number;
  netCollectedChangePercentage: number;
  pendingRevenue: number;
  refundedRevenue: number;
  totalDiscounts: number;
  paidOrdersCount: number;
  pendingOrdersCount: number;
};

export type CashflowChartPoint = {
  date: string;
  collectedAmount: number;
  pendingAmount: number;
  refundedAmount: number;
};

export type PaymentMethodSummary = {
  method: string;
  count: number;
  totalAmount: number;
  percentage: number;
};

export type PaymentStatusSummary = {
  status: string;
  count: number;
  totalAmount: number;
  percentage: number;
};

export type RecentPaymentTransaction = {
  orderId: number;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  paymentMethod: string;
  paymentStatus: string;
  finalAmount: number;
  createdAt: string;
};

export type FinanceDashboardResponse = {
  period: AdminDashboardPeriod;
  kpis: FinanceKpiSummary;
  cashflowChart: CashflowChartPoint[];
  paymentMethods: PaymentMethodSummary[];
  paymentStatuses: PaymentStatusSummary[];
  recentTransactions: RecentPaymentTransaction[];
};

export async function getAdminFinanceDashboard(
  period: AdminDashboardPeriod = "this-month",
): Promise<FinanceDashboardResponse> {
  return apiGet<FinanceDashboardResponse>(`/admin/dashboard/finance?period=${period}`);
}

export type CrmKpiSummary = {
  totalCustomers: number;
  newCustomers: number;
  newCustomersChangePercentage: number;
  activeBuyers: number;
  repeatCustomerCount: number;
  repeatPurchaseRate: number;
  averageCustomerSpend: number;
};

export type CustomerGrowthChartPoint = {
  date: string;
  newCustomersCount: number;
  activeOrdersCount: number;
};

export type MembershipTierSummary = {
  tier: "STANDARD" | "SILVER" | "GOLD" | "DIAMOND" | string;
  label: string;
  count: number;
  percentage: number;
};

export type TopCustomerSummary = {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  membershipTier: "STANDARD" | "SILVER" | "GOLD" | "DIAMOND" | string;
  tierLabel: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
};

export type CrmDashboardResponse = {
  period: AdminDashboardPeriod;
  kpis: CrmKpiSummary;
  customerGrowthChart: CustomerGrowthChartPoint[];
  membershipTiers: MembershipTierSummary[];
  topCustomers: TopCustomerSummary[];
};

export async function getAdminCrmDashboard(
  period: AdminDashboardPeriod = "this-month",
): Promise<CrmDashboardResponse> {
  return apiGet<CrmDashboardResponse>(`/admin/dashboard/crm?period=${period}`);
}

