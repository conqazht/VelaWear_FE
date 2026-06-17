import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-[#1c1a18] px-6 py-16 text-[#f7f4ef] md:px-16">
      <div className="mx-auto grid max-w-[1800px] grid-cols-1 gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <span className="mb-4 block font-serif text-3xl font-bold tracking-[0.25em] text-[#efebe4]">
            VELA WEAR
          </span>
          <p className="mb-6 max-w-sm text-xs leading-relaxed tracking-wide text-white/60">
            Nhà mốt may đo thời trang tối giản, cao cấp. Tôn vinh tính chân
            thực và tính bền vững qua từng sợi chỉ organic.
          </p>
          <form className="flex w-full max-w-sm border border-white/20">
            <Input
              type="email"
              placeholder="Nhập email của bạn"
              className="h-10 rounded-none border-0 bg-transparent px-4 text-xs text-white placeholder:text-white/40 focus-visible:ring-0"
            />
            <Button className="h-10 rounded-none bg-white px-4 text-xs font-semibold uppercase tracking-widest text-black hover:bg-[#efebe4]">
              Đăng ký
            </Button>
          </form>
        </div>

        <div>
          <h4 className="mb-4 font-serif text-sm font-medium uppercase tracking-wide text-[#efebe4]">
            Danh mục
          </h4>
          <ul className="space-y-2 text-xs text-white/60">
            <li>Áo linen và cotton</li>
            <li>Quần tailoring</li>
            <li>Lookbook Thu Đông 2026</li>
            <li>Ready to Wear</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-serif text-sm font-medium uppercase tracking-wide text-[#efebe4]">
            Hỗ trợ
          </h4>
          <ul className="space-y-2 text-xs text-white/60">
            <li>Vận chuyển toàn cầu</li>
            <li>Đổi trả 30 ngày</li>
            <li>Ưu đãi tài khoản cá nhân</li>
            <li>Bản đồ cửa hàng</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-[1800px] flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-[10px] tracking-wider text-white/40 md:flex-row">
        <p>© 2026 VELA WEAR. Meticulously designed for your aesthetic balance.</p>
        <div className="flex gap-6">
          <span>Instagram</span>
          <span>Pinterest</span>
          <span>Vimeo</span>
        </div>
      </div>
    </footer>
  );
}
