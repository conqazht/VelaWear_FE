"use client";

import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "boneyard-js/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  LockKeyhole,
  Package,
  Truck,
} from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { StorefrontApiStatus } from "@/components/errors/storefront-api-status";
import { StorefrontStatus } from "@/components/errors/storefront-status";
import { Card } from "@/components/ui/card";
import {
  getOrderByCode,
  getOrderStatusHistories,
  updateOrder,
} from "@/lib/api/commerce";
import { money } from "@/lib/vela-data";

const statusLabels: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang chuẩn bị",
  SHIPPED: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã huỷ",
};

const statusClasses: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  CONFIRMED: "border-blue-200 bg-blue-50 text-blue-700",
  PROCESSING: "border-violet-200 bg-violet-50 text-violet-700",
  SHIPPED: "border-sky-200 bg-sky-50 text-sky-700",
  DELIVERED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CANCELLED: "border-red-200 bg-red-50 text-red-700",
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
};

const getErrorMessage = (error: unknown) => {
  const apiError = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return apiError.response?.data?.message ?? apiError.message ?? "Không thể tải đơn hàng.";
};

export default function OrderDetailsClient({ code }: { code: string }) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  const orderQuery = useQuery({
    queryKey: ["orders", "code", code],
    queryFn: () => getOrderByCode(code),
    enabled: isAuthenticated && Boolean(user),
  });
  const order = orderQuery.data;
  const hasAccess = Boolean(order && order.userId === user?.id);
  const historiesQuery = useQuery({
    queryKey: ["orders", order?.id, "status-histories"],
    queryFn: () =>
      getOrderStatusHistories(order!.id, {
        size: 100,
        sort: "createdAt,asc",
      }),
    enabled: hasAccess,
  });
  const cancelMutation = useMutation({
    mutationFn: (orderId: number) => updateOrder(orderId, { status: "CANCELLED" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
  const histories = historiesQuery.data?.result ?? [];
  const error = cancelMutation.error ? getErrorMessage(cancelMutation.error) : null;

  const handleCancel = async () => {
    if (!order || !window.confirm("Bạn chắc chắn muốn huỷ đơn hàng này?")) return;

    try {
      await cancelMutation.mutateAsync(order.id);
    } catch {
      // The mutation state renders the actionable message in the order page.
    }
  };

  const isPageLoading =
    isAuthLoading || (isAuthenticated && orderQuery.isLoading);

  if (isPageLoading) {
    return (
      <Skeleton
        name="order-details"
        loading
        className="mx-auto w-full max-w-[1280px] px-6 py-16 md:px-16"
        fallback={<OrderDetailsLoadingFallback />}
        fixture={<OrderDetailsLoadingFixture />}
      >
        <OrderDetailsLoadingFixture />
      </Skeleton>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-[1800px] flex-col items-center justify-center px-6 py-24">
        <Card className="mx-auto flex max-w-md flex-col items-center rounded-sm border-[#1c1a18]/5 bg-[#efe7dc] p-8 py-10 text-center shadow-lg">
          <LockKeyhole className="mb-6 size-12 text-[#b85a3c]" />
          <h2 className="mb-4 font-serif text-2xl font-light text-[#1c1a18]">Đăng nhập để xem đơn hàng</h2>
          <p className="mb-8 text-xs leading-relaxed text-[#1c1a18]/65">
            Bạn cần đăng nhập tài khoản Vela Member để xem chi tiết đơn đặt hàng này.
          </p>
          <Link href="/sign-in" className="inline-flex w-full justify-center rounded-sm bg-[#1c1a18] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#b85a3c]">
            Đăng nhập ngay
          </Link>
        </Card>
      </div>
    );
  }

  if (orderQuery.isError) {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-6 py-16 md:px-16">
        <StorefrontApiStatus
          error={orderQuery.error}
          onRetry={() => void orderQuery.refetch()}
          resourceLabel="đơn hàng"
          returnHref="/profile?tab=orders"
          returnLabel="Về lịch sử đơn hàng"
          variant="panel"
        />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-6 py-16 md:px-16">
        <StorefrontStatus
          status={404}
          eyebrow="VELA MEMBER / ĐƠN HÀNG"
          title="Không tìm thấy đơn hàng này"
          description="Mã đơn có thể không còn hợp lệ hoặc đường dẫn đã thay đổi. Bạn có thể quay lại lịch sử để chọn một đơn hàng khác."
          primaryAction={{ label: "Về lịch sử đơn hàng", href: "/profile?tab=orders" }}
          secondaryAction={{ label: "Tiếp tục mua sắm", href: "/collection" }}
          variant="panel"
        />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-6 py-16 md:px-16">
        <StorefrontStatus
          status={403}
          eyebrow="VELA MEMBER / QUYỀN TRUY CẬP"
          title="Đơn hàng này không thuộc tài khoản của bạn"
          description="Bạn đã đăng nhập nhưng tài khoản hiện tại không có quyền xem thông tin của đơn hàng này."
          primaryAction={{ label: "Về đơn hàng của tôi", href: "/profile?tab=orders" }}
          secondaryAction={{ label: "Về trang chủ", href: "/" }}
          variant="panel"
        />
      </div>
    );
  }

  if (historiesQuery.isError) {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-6 py-16 md:px-16">
        <StorefrontApiStatus
          error={historiesQuery.error}
          onRetry={() => void historiesQuery.refetch()}
          resourceLabel="lịch sử trạng thái đơn hàng"
          returnHref="/profile?tab=orders"
          returnLabel="Về lịch sử đơn hàng"
          variant="panel"
        />
      </div>
    );
  }

  const canCancel = ["PENDING", "CONFIRMED"].includes(order.status);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <main className="mx-auto w-full max-w-[1280px] px-6 py-16 md:px-16">
        <Link href="/profile?tab=orders" className="mb-8 inline-flex text-xs font-semibold uppercase tracking-widest text-[#1c1a18]/55 hover:text-[#1c1a18]">← Đơn hàng của tôi</Link>

        <header className="mb-10 flex flex-col justify-between gap-6 border-b border-[#1c1a18]/10 pb-8 md:flex-row md:items-end">
          <div>
            <h1 className="mb-4 font-serif text-3xl font-light text-[#1c1a18] md:text-5xl">Chi tiết đơn hàng</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-[#1c1a18]/70">
              <span>Mã đơn: <strong className="font-semibold text-[#1c1a18]">{order.orderCode}</strong></span>
              <span>•</span>
              <span>{formatDateTime(order.createdAt)}</span>
            </div>
          </div>
          <span className={`w-fit rounded-sm border px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest ${statusClasses[order.status] ?? statusClasses.PENDING}`}>
            {statusLabels[order.status] ?? order.status}
          </span>
        </header>

        {error && <div className="mb-6 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="flex flex-col gap-8 lg:col-span-8">
            <Card className="rounded-md border-none bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-[#1c1a18]">Sản phẩm đã đặt ({order.items?.length ?? 0})</h2>
              {order.items?.length ? (
                <div className="divide-y divide-[#1c1a18]/8">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-5 py-5 first:pt-0 last:pb-0">
                      <div className="relative flex aspect-[3/4] w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-sm bg-[#f7f4ef] md:w-24">
                        {item.image ? <Image src={item.image} alt={item.productName} fill sizes="(min-width: 768px) 96px, 80px" unoptimized className="object-cover" /> : <Package className="size-7 text-[#1c1a18]/25" />}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-center">
                        <div className="flex justify-between gap-4">
                          <h3 className="font-medium text-[#1c1a18]">{item.productName}</h3>
                          <span className="whitespace-nowrap font-medium">{money(item.subtotal)}</span>
                        </div>
                        {item.variantName && <p className="mt-1 text-xs text-[#1c1a18]/60">{item.variantName}</p>}
                        <p className="mt-1 text-xs text-[#1c1a18]/45">SKU: {item.sku} · {money(item.price)} × {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-[#1c1a18]/50">Đơn hàng chưa có thông tin sản phẩm.</p>
              )}
            </Card>

            <Card className="rounded-md border-none bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-[#1c1a18]">Lịch sử trạng thái</h2>
              <div className="space-y-5">
                <div className="flex gap-4">
                  <CheckCircle2 className="mt-0.5 size-5 text-emerald-600" />
                  <div><p className="text-sm font-medium">Đã tạo đơn hàng</p><p className="mt-1 text-xs text-[#1c1a18]/50">{formatDateTime(order.createdAt)}</p></div>
                </div>
                {histories.map((history) => (
                  <div key={history.id} className="flex gap-4">
                    <Clock3 className="mt-0.5 size-5 text-[#b85a3c]" />
                    <div>
                      <p className="text-sm font-medium">{statusLabels[history.fromStatus ?? ""] ?? history.fromStatus ?? "Khởi tạo"} → {statusLabels[history.toStatus] ?? history.toStatus}</p>
                      {history.reason && <p className="mt-1 text-xs text-[#1c1a18]/65">{history.reason}</p>}
                      <p className="mt-1 text-xs text-[#1c1a18]/50">{formatDateTime(history.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex flex-wrap gap-3">
              {canCancel && <button type="button" disabled={cancelMutation.isPending} onClick={handleCancel} className="rounded-sm border border-red-200 px-6 py-3 text-xs font-bold uppercase tracking-widest text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">{cancelMutation.isPending ? "Đang huỷ..." : "Huỷ đơn hàng"}</button>}
              <Link href="/help" className="rounded-sm border border-[#1c1a18]/20 px-6 py-3 text-xs font-bold uppercase tracking-widest text-[#1c1a18] hover:bg-[#f7f4ef]">Yêu cầu hỗ trợ</Link>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-4">
            <Card className="rounded-md border-none bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xs font-bold uppercase tracking-widest">Tổng thanh toán</h2>
              <div className="mb-6 flex flex-col gap-4 border-b border-[#1c1a18]/10 pb-6 text-sm text-[#1c1a18]/70">
                <div className="flex justify-between"><span>Tạm tính</span><span>{money(Number(order.subtotal ?? 0))}</span></div>
                <div className="flex justify-between"><span>Phí vận chuyển</span><span>{Number(order.shippingFee) > 0 ? money(Number(order.shippingFee)) : "Miễn phí"}</span></div>
                <div className="flex justify-between text-[#b85a3c]"><span>Khuyến mãi</span><span>-{money(Number(order.discountAmount ?? 0))}</span></div>
              </div>
              <div className="flex items-end justify-between"><span className="text-sm font-semibold">Tổng cộng</span><span className="font-serif text-2xl">{money(Number(order.finalAmount ?? 0))}</span></div>
            </Card>

            <Card className="rounded-md border-none bg-[#f7f4ef]/50 p-6 shadow-sm">
              <h2 className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest"><Truck className="size-4 text-[#1c1a18]/40" />Thông tin giao hàng</h2>
              <div className="space-y-1.5 text-[13px] text-[#1c1a18]/70"><p className="font-semibold text-[#1c1a18]">{order.receiverName}</p><p>{order.receiverPhone}</p><p className="pt-2 leading-relaxed">{order.receiverAddress}</p></div>
            </Card>

            <Card className="rounded-md border-none bg-[#f7f4ef]/50 p-6 shadow-sm">
              <h2 className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest"><CreditCard className="size-4 text-[#1c1a18]/40" />Thanh toán</h2>
              <p className="text-sm font-medium">{order.paymentMethod ?? "—"}</p><p className="mt-1 text-xs text-[#1c1a18]/55">{order.paymentStatus ?? "—"}</p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export function OrderDetailsLoadingFallback() {
  return (
    <div className="space-y-10" aria-hidden="true">
      <div className="h-28 rounded-md bg-white" />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <div className="h-72 rounded-md bg-white" />
          <div className="h-64 rounded-md bg-white" />
        </div>
        <div className="space-y-6 lg:col-span-4">
          <div className="h-64 rounded-md bg-white" />
          <div className="h-40 rounded-md bg-white" />
        </div>
      </div>
    </div>
  );
}

function OrderDetailsLoadingFixture() {
  return (
    <div className="space-y-10">
      <header className="border-b border-[#1c1a18]/10 pb-8">
        <h1 className="font-serif text-5xl">Chi tiết đơn hàng</h1>
        <p className="mt-4">Mã đơn: VW-CONGANH-0000</p>
      </header>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <section className="min-h-72 rounded-md bg-white p-8"><h2>Sản phẩm đã đặt</h2></section>
          <section className="min-h-64 rounded-md bg-white p-8"><h2>Lịch sử trạng thái</h2></section>
        </div>
        <aside className="space-y-6 lg:col-span-4">
          <section className="min-h-64 rounded-md bg-white p-6"><h2>Tổng thanh toán</h2></section>
          <section className="min-h-40 rounded-md bg-white p-6"><h2>Thông tin giao hàng</h2></section>
        </aside>
      </div>
    </div>
  );
}
