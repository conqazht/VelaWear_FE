"use client";

import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-[#1c1a18] px-6 py-16 text-[#f7f4ef] md:px-16">
      <div className="mx-auto flex flex-col justify-between gap-12 max-w-[1800px] md:flex-row md:items-start">
        {/* Left column: brand & newsletter */}
        <div className="flex flex-col gap-4 max-w-md">
          <span className="font-serif text-3xl font-bold tracking-[0.25em] text-[#efebe4]">
            VELA WEAR
          </span>
          <p className="text-sm leading-relaxed text-[#f7f4ef]/70">
            Đăng ký để nhận thông tin về bộ sưu tập mới và các bài viết editorial độc quyền.
          </p>
          <form 
            onSubmit={(e) => e.preventDefault()}
            className="mt-2 flex w-full max-w-sm border border-white/20 bg-transparent"
          >
            <input
              type="email"
              placeholder="Email của bạn"
              className="h-10 w-full rounded-none border-0 bg-transparent px-4 text-xs text-[#f7f4ef] placeholder:text-[#f7f4ef]/40 focus:outline-none focus:ring-0"
            />
            <button 
              type="submit"
              className="h-10 rounded-none bg-[#b5573a] px-6 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#a04a30] whitespace-nowrap"
            >
              Đăng ký
            </button>
          </form>
        </div>

        {/* Right columns */}
        <div className="flex gap-16 md:gap-32">
          {/* Chính Sách */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#b5573a]">
              Chính Sách
            </h4>
            <ul className="flex flex-col gap-3 text-sm text-[#f7f4ef]/60">
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Hỗ Trợ */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#b5573a]">
              Hỗ Trợ
            </h4>
            <ul className="flex flex-col gap-3 text-sm text-[#f7f4ef]/60">
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Sustainability
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-[1800px] border-t border-white/10 pt-8 text-center text-xs tracking-[0.15em] text-[#f7f4ef]/40">
        <p>© 2024 VELA WEAR. ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  );
}
