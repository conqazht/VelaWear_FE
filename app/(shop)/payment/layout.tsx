import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kết Quả Thanh Toán",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
