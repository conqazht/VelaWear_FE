"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Truck, CreditCard, LockKeyhole } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import apiClient from "@/lib/api-client";
import { money } from "@/lib/vela-data";
import { Card } from "@/components/ui/card";

interface Order {
  id: number;
  userId: number;
  userFullName: string;
  userEmail: string;
  orderCode: string;
  status: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailsClient({ code }: { code: string }) {
  const { user, isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    async function fetchOrder() {
      try {
        const response = await apiClient.get(`/orders/code/${code}`);
        if (response.data?.data) {
          setOrder(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch order details", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrder();
  }, [code, user, isAuthenticated]);

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto w-full max-w-[1800px] px-6 py-24 min-h-[70vh] flex flex-col justify-center items-center">
        <Card className="mx-auto flex max-w-md flex-col items-center rounded-sm border-[#1c1a18]/5 bg-[#efe7dc] p-8 py-10 text-center shadow-lg">
          <LockKeyhole className="mb-6 size-12 text-[#b85a3c]" />
          <h2 className="mb-4 font-serif text-2xl font-light text-[#1c1a18]">
            Đăng nhập để xem đơn hàng
          </h2>
          <p className="mb-8 text-xs leading-relaxed text-[#1c1a18]/65">
            Bạn cần đăng nhập tài khoản Vela Member để xem chi tiết đơn đặt hàng này.
          </p>
          <Link
            href="/sign-in"
            className="inline-flex w-full justify-center rounded-sm bg-[#1c1a18] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#b85a3c]"
          >
            Đăng nhập ngay
          </Link>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-6 py-32 text-center select-none">
        <span className="text-xs uppercase tracking-widest text-ink/40">Đang tải chi tiết đơn hàng...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-6 py-32 text-center select-none">
        <span className="text-xs uppercase tracking-widest text-[#b85a3c] block mb-4">Không tìm thấy đơn hàng</span>
        <Link href="/profile" className="text-xs uppercase tracking-widest text-ink underline">
          Quay lại Hồ sơ
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-canvas text-ink min-h-screen flex flex-col">
      {/* Top navbar breadcrumb sub-navigation */}
      <div className="w-full border-b border-hairline/40 select-none">
        <div className="max-w-[1280px] mx-auto flex justify-center gap-8 py-4">
          <Link href="/profile" className="text-sm font-medium tracking-[0.05em] text-[#55423d]/60 hover:text-ink">
            Profile
          </Link>
          <Link href="/profile?tab=orders" className="text-sm font-medium tracking-[0.05em] text-primary border-b-2 border-primary pb-1 -mb-[18px]">
            Orders
          </Link>
          <Link href="/profile?tab=favourites" className="text-sm font-medium tracking-[0.05em] text-[#55423d]/60 hover:text-ink">
            Favourites
          </Link>
          <Link href="/profile/settings" className="text-sm font-medium tracking-[0.05em] text-[#55423d]/60 hover:text-ink">
            Settings
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow max-w-[1280px] mx-auto w-full px-6 md:px-16 py-16 text-left">
        {/* Header */}
        <header className="mb-8 pb-8 border-b border-hairline flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-serif text-3xl md:text-5xl text-ink font-light mb-4">Chi tiết đơn hàng</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#55423d]/80">
              <span>Mã đơn: <strong className="text-ink font-medium tracking-wide">{order.orderCode}</strong></span>
              <span className="w-1.5 h-1.5 rounded-full bg-hairline hidden md:block"></span>
              <span>Đặt ngày: {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : ""}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-surface-card rounded-full text-[10px] font-semibold text-primary tracking-widest uppercase">
              {order.status}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Order Items */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <section>
              <h2 className="text-xs font-semibold text-[#55423d]/80 mb-6 uppercase tracking-widest">Sản phẩm đã đặt</h2>
              <div className="flex flex-col gap-6">
                {/* Product Item 1 */}
                <div className="flex gap-6 group">
                  <div className="w-24 md:w-32 flex-shrink-0 bg-surface-card aspect-[3/4] overflow-hidden rounded-none border border-hairline/20">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      alt="Áo Sơ Mi Linen Cổ Điển"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2l2DEaTM8uqBkds2YrUeaz1VwM5rs71hZ6M68uBV078z_7TtKNmuCN4tUlmarK3zkyC2FAfbQ0ZtFlZYe2_nN6LZ8TcOpcla27Q6kBIYryOfwDFVeFrHued3lziKH1PnTqyt6jjDZ0aOLoVCKvaI684Y4aQ-iQfjVDyLqkzROkTtj61hHjZLpR8-7ASH3N8wtYlmeMdUkloP3VMdutoKSzPGBpq8CH9IZ1KG8X4ERUVIbkhKA3xdDwNCBBeoLGlAuJSnFiXpdwa1i"
                    />
                  </div>
                  <div className="flex flex-col flex-grow justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h3 className="text-sm font-semibold text-ink">Áo Sơ Mi Linen Cổ Điển</h3>
                        <span className="text-sm font-medium text-ink whitespace-nowrap">1.250.000 ₫</span>
                      </div>
                      <p className="text-xs text-[#55423d]/70 mb-1">Màu: Cát Cháy (Sand)</p>
                      <p className="text-xs text-[#55423d]/70">Size: M</p>
                    </div>
                    <div className="text-xs text-[#55423d]/60">
                      Số lượng: 1
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-hairline/60"></div>

                {/* Product Item 2 */}
                <div className="flex gap-6 group">
                  <div className="w-24 md:w-32 flex-shrink-0 bg-surface-card aspect-[3/4] overflow-hidden rounded-none border border-hairline/20">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      alt="Quần Tây Nam Ống Rộng"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCknAfhKOqFl1y2Dfc8z71W56m4JtXJSkw10JwrVfLOLwTFK4prYzm9lz4bT0N7i3za9cwvyoW4bsq4VZllm-N5ai0TNYsMvqxEUOqFow-MkmHsferUMmhmKqjq8Ecs5fsm7Nych-VDLDsboQpi0-lHtbl9E-uFRGe5u7j8d-gXoNG-iilh_lJIwDuxlkOgs5YmQySfq72ft9jQXHHGzt-qgYYPQRdTKjf0AsEna26WSoRQ6bNlhzqGpfuzq73sT42k9Z6Pm7Ov92yv"
                    />
                  </div>
                  <div className="flex flex-col flex-grow justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h3 className="text-sm font-semibold text-ink">Quần Tây Nam Ống Rộng</h3>
                        <span className="text-sm font-medium text-ink whitespace-nowrap">1.850.000 ₫</span>
                      </div>
                      <p className="text-xs text-[#55423d]/70 mb-1">Màu: Xanh Rêu (Olive)</p>
                      <p className="text-xs text-[#55423d]/70">Size: 31</p>
                    </div>
                    <div className="text-xs text-[#55423d]/60">
                      Số lượng: 1
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <div className="mt-8 flex gap-4">
              <button
                className="bg-primary text-on-primary text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-sm hover:bg-[#8f4329] transition-colors"
                type="button"
              >
                Mua lại đơn này
              </button>
              <button
                className="bg-transparent border border-hairline text-ink text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-sm hover:bg-surface-card transition-colors"
                type="button"
              >
                Yêu cầu hỗ trợ
              </button>
            </div>
          </div>

          {/* Right Column: Summary & Info */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            {/* Order Summary Card */}
            <div className="bg-surface-card rounded-md p-6">
              <h2 className="text-xs font-semibold text-ink mb-6 uppercase tracking-widest">Tổng Thanh Toán</h2>
              <div className="flex flex-col gap-4 text-sm text-[#55423d]/80 mb-6 border-b border-hairline/80 pb-6">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>{money(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span>{order.shippingFee > 0 ? money(order.shippingFee) : "Miễn phí"}</span>
                </div>
                <div className="flex justify-between text-primary">
                  <span>Khuyến mãi áp dụng</span>
                  <span>-{money(order.discountAmount)}</span>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm font-semibold text-ink">Tổng cộng</span>
                <span className="font-serif text-2xl text-ink font-light">
                  {money(order.finalAmount)}
                </span>
              </div>
            </div>

            {/* Shipping Info Card */}
            <div className="bg-[#f9f2ef] border border-hairline/60 rounded-md p-6">
              <h2 className="text-xs font-semibold text-ink mb-6 uppercase tracking-widest flex items-center gap-2">
                <Truck className="text-primary w-5 h-5 flex-shrink-0" />
                Giao hàng
              </h2>
              <div className="text-sm text-[#55423d]/80 space-y-2">
                <p className="font-semibold text-ink">{order.receiverName}</p>
                <p>{order.receiverPhone}</p>
                <p className="leading-relaxed whitespace-pre-line">{order.receiverAddress}</p>
              </div>
            </div>

            {/* Payment Info Card */}
            <div className="bg-[#f9f2ef] border border-hairline/60 rounded-md p-6">
              <h2 className="text-xs font-semibold text-ink mb-6 uppercase tracking-widest flex items-center gap-2">
                <CreditCard className="text-primary w-5 h-5 flex-shrink-0" />
                Thanh toán
              </h2>
              <div className="text-sm text-[#55423d]/80 flex items-center gap-3">
                <div className="w-12 h-8 bg-surface-card rounded border border-hairline/60 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-ink">{order.paymentMethod}</span>
                </div>
                <p>{order.paymentStatus}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
