import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FashionImage } from "@/components/shop/fashion-image";

export function HomePage() {
  return (
    <div className="font-sans">
      <header className="relative flex h-[85vh] min-h-[620px] w-full items-center justify-center overflow-hidden bg-black">
        <FashionImage
          src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=1200&q=80"
          alt="Warm luxury fashion statement hero"
          priority
          className="scale-105 opacity-85 transition-transform duration-[12000ms] hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1a18]/80 via-[#1c1a18]/30 to-[#1c1a18]/20" />

        <div className="relative flex max-w-3xl flex-col items-center px-4 text-center">
          <span className="mb-3 font-serif text-base italic tracking-wide text-white/80 md:text-xl">
            New Arrival Autumn / Winter
          </span>
          <h1 className="mb-6 font-serif text-4xl font-medium leading-tight tracking-[0.08em] text-white md:text-6xl">
            Vela Wear, Bộ sưu tập Thu 2026
          </h1>
          <p className="mb-10 max-w-xl text-xs font-light leading-relaxed tracking-wide text-white/80 md:text-sm">
            Tự nhiên, tinh tế và bền vững. Những phom dáng rộng rãi, mềm mại
            giao hòa cùng chất liệu tự nhiên thượng hạng.
          </p>
          <Link
            href="/collection"
            className="inline-flex items-center gap-2 rounded-sm bg-[#f7f4ef] px-8 py-4 font-serif text-sm font-medium uppercase tracking-[0.2em] text-[#1c1a18] shadow-md transition-colors hover:bg-[#efebe4]"
          >
            Khám phá ngay
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-6 py-20 md:px-12">
        <div className="mb-16 text-center">
          <h2 className="font-serif text-2xl font-semibold uppercase tracking-[0.1em] text-[#1c1a18] md:text-3xl">
            Danh Mục Nổi Bật
          </h2>
          <div className="mx-auto mt-4 h-px w-12 bg-[#1c1a18]/30" />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              label: "Áo",
              count: "Xem 18 mẫu sản phẩm",
              src: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=600&q=80",
            },
            {
              label: "Quần",
              count: "Xem 12 mẫu sản phẩm",
              src: "https://lh3.googleusercontent.com/aida-public/AB6AXuC58QFuYm347f2m7MjhHsd2uXYjt-dAaH4FjsDOYeZsr-qOhwJXqIyk23MD0kIBUVwEanSVmrqDRQpkHZaS3R5yj-CQpAM7EqJ25kHsgG83wEArI9LWdJzcnO7b4m2ino_YJD-85mAywT7I7e4xaxctAEuOR1onfiC54OCsvwQx3759F8qemesRZPIhVboGWkHj7sGqU6u53viMZWFo1YUa7pTdX6DakZQgBi8KNW_6a2D4cOEsYCW7Fq-qKGWBPXVtDbYR4PFpCFA7",
            },
            {
              label: "Phụ kiện",
              count: "Xem bộ phụ kiện da cao cấp",
              src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDZZXOEtNU4X4Zg1abxbttZhHHgH7B7FQBM94YaLOrnaelQB_9fDtmKTdyzMCnEXY6iEgkmTh30vOMrJQUhG0StULSPxvnwcoylPo1T7ySAAVijYo2H1FJ3n767TvM6tFDXtjV70QGz5s1zSdA2T-qnM2BL2q2eXqE5rE7t7wYYb2ILKVuC356nb7BrAR2F8ydBVN1gOEtu8vxTrYPz5FPcI3i2v4QfzTGw2GY7WHjIL2yq2jiZzv7uri3fvSdrWOBjLNduC6YsLzXa",
            },
          ].map((item) => (
            <Link
              key={item.label}
              href="/collection"
              className="group overflow-hidden rounded-sm bg-white text-left transition-all duration-500 hover:shadow-xl"
            >
              <div className="relative h-[480px] overflow-hidden bg-zinc-100">
                <FashionImage
                  src={item.src}
                  alt={item.label}
                  className="transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#1c1a18]/10 transition-colors duration-500 group-hover:bg-[#1c1a18]/25" />
                <div className="absolute bottom-8 left-8">
                  <span className="mb-1 block font-serif text-2xl font-light uppercase tracking-[0.25em] text-white">
                    {item.label}
                  </span>
                  <span className="block text-[10px] font-medium uppercase tracking-widest text-white/80 transition-transform duration-300 group-hover:translate-x-1">
                    {item.count} →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-[#1c1a18]/5 bg-white px-6 py-24 md:px-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 md:grid-cols-2">
          <div className="md:pr-12">
            <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.25em] text-[#b85a3c]">
              Mùa Thu 2026 / Sự Tĩnh Lặng Trầm Ấm
            </span>
            <h2 className="mb-8 font-serif text-3xl font-medium leading-tight tracking-tight text-[#1c1a18] md:text-5xl">
              Tâm tình gởi gắm qua từng sợi vải linen lành tính
            </h2>
            <p className="mb-6 text-sm leading-relaxed tracking-wide text-[#1c1a18]/70">
              Lấy cảm hứng từ những buổi chiều tà bình lặng ở ngoại ô, bộ sưu
              tập Thu 2026 mang đến thiết kế tối giản nhưng giàu chi tiết.
            </p>
            <p className="mb-10 text-sm leading-relaxed tracking-wide text-[#1c1a18]/70">
              Tất cả sản phẩm đều được may đo thủ công tỉ mỉ và nhuộm màu bằng
              nguyên liệu hữu cơ thân thiện môi trường.
            </p>
            <Link
              href="/collection"
              className="inline-flex items-center gap-2 font-serif text-sm font-semibold uppercase tracking-[0.15em] text-[#1c1a18] transition-colors hover:text-[#b85a3c]"
            >
              Xem chi tiết bộ sưu tập
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-[#efebe4] shadow-sm">
              <FashionImage
                src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=720&q=80"
                alt="Story lifestyle feature"
                className="object-top transition-transform duration-700 hover:scale-[1.02]"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden border border-[#1c1a18]/5 bg-[#f7f4ef]/95 p-6 sm:block">
              <p className="font-serif text-base font-semibold italic text-[#1c1a18]">
                &quot;Thủ công, tối giản, và tôn trọng tự nhiên.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
