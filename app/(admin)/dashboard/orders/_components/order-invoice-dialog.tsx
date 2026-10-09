"use client";

import { useRef } from "react";
import { Printer } from "lucide-react";

import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminOrder } from "@/lib/api/admin-orders";
import { formatCurrency, formatDateTime } from "@/lib/i18n/format";
import {
  getOrderStatusLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from "./order-status-badge";

type OrderInvoiceDialogProps = {
  order: AdminOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OrderInvoiceDialog({ order, open, onOpenChange }: OrderInvoiceDialogProps) {
  const { locale, t } = useI18n();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto sm:max-w-2xl print:m-0 print:max-h-none print:max-w-none print:border-none print:p-0 print:shadow-none">
        <DialogHeader className="print:hidden">
          <div className="flex items-center justify-between pr-8">
            <div>
              <DialogTitle className="text-xl font-bold">
                {locale === "vi" ? "Hóa đơn bán hàng" : "Sales Invoice"}
              </DialogTitle>
              <DialogDescription>
                {locale === "vi"
                  ? `Mã đơn hàng: #${order.orderCode}`
                  : `Order Code: #${order.orderCode}`}
              </DialogDescription>
            </div>
            <Button type="button" size="sm" onClick={handlePrint} className="gap-1.5">
              <Printer className="size-4" />
              {locale === "vi" ? "In hóa đơn" : "Print Invoice"}
            </Button>
          </div>
        </DialogHeader>

        {/* Printable invoice body */}
        <div ref={printRef} className="space-y-6 rounded-lg border bg-card p-6 text-card-foreground print:border-none print:bg-white print:p-0 print:text-black">
          {/* Brand header */}
          <div className="flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-2xl font-black tracking-wider uppercase text-foreground print:text-black">
                VELA WEAR
              </h2>
              <p className="text-xs text-muted-foreground print:text-gray-600">
                {locale === "vi" ? "Thời trang nam nữ cao cấp" : "Premium Fashion Store"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground print:text-gray-600">
                Email: support@velawear.vn | Hotline: 1900 6868
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="inline-block rounded border bg-muted/40 px-3 py-1 font-mono text-sm font-bold print:border-gray-400 print:bg-transparent">
                #{order.orderCode}
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground print:text-gray-600">
                {locale === "vi" ? "Ngày đặt" : "Order Date"}: {formatDateTime(order.createdAt, locale)}
              </p>
            </div>
          </div>

          {/* Customer and shipping info */}
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-md border p-3.5 print:border-gray-300">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground print:text-gray-600">
                {locale === "vi" ? "Thông tin nhận hàng" : "Shipping Details"}
              </p>
              <p className="mt-1.5 font-medium">{order.receiverName}</p>
              <p className="text-xs text-muted-foreground print:text-gray-700">
                {locale === "vi" ? "SĐT" : "Phone"}: {order.receiverPhone}
              </p>
              <p className="mt-1 text-xs text-muted-foreground print:text-gray-700">
                {order.receiverAddress}
              </p>
            </div>

            <div className="rounded-md border p-3.5 print:border-gray-300">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground print:text-gray-600">
                {locale === "vi" ? "Thanh toán & Trạng thái" : "Payment & Status"}
              </p>
              <div className="mt-1.5 space-y-1 text-xs">
                <p>
                  <span className="text-muted-foreground print:text-gray-600">
                    {locale === "vi" ? "Phương thức: " : "Method: "}
                  </span>
                  <span className="font-medium">{getPaymentMethodLabel(order.paymentMethod, t)}</span>
                </p>
                <p>
                  <span className="text-muted-foreground print:text-gray-600">
                    {locale === "vi" ? "Thanh toán: " : "Payment: "}
                  </span>
                  <span className="font-medium">{getPaymentStatusLabel(order.paymentStatus, t)}</span>
                </p>
                <p>
                  <span className="text-muted-foreground print:text-gray-600">
                    {locale === "vi" ? "Trạng thái đơn: " : "Order Status: "}
                  </span>
                  <span className="font-medium">{getOrderStatusLabel(order.status, t)}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Items table */}
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>{locale === "vi" ? "Sản phẩm" : "Product"}</TableHead>
                  <TableHead className="text-center">{locale === "vi" ? "SKU" : "SKU"}</TableHead>
                  <TableHead className="text-right">{locale === "vi" ? "Đơn giá" : "Unit Price"}</TableHead>
                  <TableHead className="text-center">{locale === "vi" ? "SL" : "Qty"}</TableHead>
                  <TableHead className="text-right">{locale === "vi" ? "Thành tiền" : "Total"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item, index) => (
                  <TableRow key={item.id ?? index}>
                    <TableCell className="text-center font-mono text-xs">{index + 1}</TableCell>
                    <TableCell>
                      <p className="font-medium">{item.productName}</p>
                      {item.variantName ? (
                        <p className="text-xs text-muted-foreground print:text-gray-600">
                          {item.variantName}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs text-muted-foreground">
                      {item.sku}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {formatCurrency(item.price, locale)}
                    </TableCell>
                    <TableCell className="text-center text-xs font-semibold">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right text-xs font-semibold">
                      {formatCurrency(item.subtotal, locale)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground print:text-gray-600">
                  {locale === "vi" ? "Tạm tính:" : "Subtotal:"}
                </span>
                <span>{formatCurrency(order.subtotal, locale)}</span>
              </div>
              {order.discountAmount > 0 ? (
                <div className="flex justify-between text-emerald-600 print:text-emerald-700">
                  <span>{locale === "vi" ? "Giảm giá:" : "Discount:"}</span>
                  <span>-{formatCurrency(order.discountAmount, locale)}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-muted-foreground print:text-gray-600">
                  {locale === "vi" ? "Phí vận chuyển:" : "Shipping Fee:"}
                </span>
                <span>{formatCurrency(order.shippingFee, locale)}</span>
              </div>
              <Separator className="my-1.5" />
              <div className="flex justify-between text-base font-bold text-foreground print:text-black">
                <span>{locale === "vi" ? "Tổng cộng:" : "Total Amount:"}</span>
                <span>{formatCurrency(order.finalAmount, locale)}</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="border-t pt-4 text-center text-xs text-muted-foreground print:text-gray-500">
            <p>
              {locale === "vi"
                ? "Cảm ơn quý khách đã tin tưởng và ủng hộ Vela Wear!"
                : "Thank you for choosing Vela Wear!"}
            </p>
          </div>
        </div>

        <DialogFooter className="print:hidden">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {locale === "vi" ? "Đóng" : "Close"}
          </Button>
          <Button type="button" size="sm" onClick={handlePrint} className="gap-1.5">
            <Printer className="size-4" />
            {locale === "vi" ? "In hóa đơn" : "Print"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
