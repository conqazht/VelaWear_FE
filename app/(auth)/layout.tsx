import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Xác Thực Tài Khoản",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
