import Link from "next/link";
import type { ReactNode } from "react";

import { BrandMark } from "@/components/shop/brand-mark";

interface AuthShellProps {
  children: ReactNode;
  includeHeader?: boolean;
  className?: string;
}

export function AuthShell({
  children,
  includeHeader = false,
  className,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#f7f4ef] text-[#1c1a18]">
      {includeHeader && (
        <header className="flex h-[71px] items-center justify-center border-b border-[#e3dccf] bg-[#f7f4ef] px-4">
          <Link
            href="/"
            className="inline-block transition-opacity hover:opacity-90"
          >
            <BrandMark />
          </Link>
        </header>
      )}
      <div className={className}>{children}</div>
    </main>
  );
}
