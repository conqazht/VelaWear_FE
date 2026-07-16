"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ChevronDown, Footprints, Ruler, Shirt, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import {
  ACCESSORY_SIZE_NOTES,
  formatMeasurement,
  INTERNATIONAL_SIZE_ROWS,
  parseAvailableSizes,
  PLUS_BODY_SIZES,
  SHOE_SIZES,
  STANDARD_BODY_SIZES,
  type BodySize,
  type MeasurementUnit,
} from "../_data/size-guide-data";

type GuideSection = "apparel" | "shoes" | "accessories";

function guideSectionForCategory(category: string | null): GuideSection {
  if (category === "giay") return "shoes";
  if (category === "phu-kien") return "accessories";
  return "apparel";
}

function SizeUnitToggle({
  unit,
  onChange,
}: {
  unit: MeasurementUnit;
  onChange: (unit: MeasurementUnit) => void;
}) {
  return (
    <div className="inline-flex rounded-full bg-[#efe7dc] p-1" role="group" aria-label="Measurement unit">
      {(["in", "cm"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={unit === option}
          className={cn(
            "min-w-16 rounded-full px-5 py-2 text-sm font-semibold transition-colors",
            unit === option
              ? "border border-[#1c1a18]/15 bg-white text-[#1c1a18]"
              : "text-[#1c1a18]/55 hover:text-[#1c1a18]",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function BodyMeasurementTable({
  sizes,
  unit,
  selectedSize,
  availableSizes,
  labels,
}: {
  sizes: BodySize[];
  unit: MeasurementUnit;
  selectedSize: string;
  availableSizes: Set<string>;
  labels: { size: string; bust: string; waist: string; hip: string };
}) {
  const rows: Array<{ key: "bust" | "waist" | "hip"; label: string }> = [
    { key: "bust", label: labels.bust },
    { key: "waist", label: labels.waist },
    { key: "hip", label: labels.hip },
  ];

  const columnClass = (size: string) => {
    const normalized = size.toLocaleUpperCase();
    const selected = selectedSize === normalized;
    const unavailable = availableSizes.size > 0 && !availableSizes.has(normalized);
    return cn(
      "min-w-28 border-l border-[#1c1a18]/8 px-4 py-5 text-left",
      selected && "bg-[#f1dfd6] text-[#8f402a]",
      unavailable && !selected && "bg-[#1c1a18]/[0.025] text-[#1c1a18]/30",
    );
  };

  return (
    <div className="overflow-x-auto border border-[#1c1a18]/10">
      <table className="w-full min-w-[860px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[#1c1a18]/10">
            <th className="sticky left-0 z-10 min-w-40 bg-[#f7f4ef] px-5 py-5 text-left font-semibold">{labels.size}</th>
            {sizes.map((size) => (
              <th key={size.size} className={columnClass(size.size)}>
                <span className="inline-flex items-center gap-2 font-semibold">
                  {size.size}
                  {selectedSize === size.size.toLocaleUpperCase() && <Check className="size-3.5" aria-label="Selected" />}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b border-[#1c1a18]/10 last:border-0">
              <th className="sticky left-0 z-10 bg-[#f7f4ef] px-5 py-5 text-left font-semibold">
                {row.label} ({unit})
              </th>
              {sizes.map((size) => (
                <td key={`${size.size}-${row.key}`} className={columnClass(size.size)}>
                  {formatMeasurement(size[row.key], unit)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SizeGuideClient() {
  const searchParams = useSearchParams();
  const { locale } = useI18n();
  const category = searchParams.get("category");
  const selectedSize = (searchParams.get("size") ?? "").trim().toLocaleUpperCase();
  const productSlug = (searchParams.get("product") ?? "").trim();
  const availableSizes = useMemo(
    () => parseAvailableSizes(searchParams.get("available")),
    [searchParams],
  );
  const [unit, setUnit] = useState<MeasurementUnit>("cm");
  const [activeSection, setActiveSection] = useState<GuideSection>(() => guideSectionForCategory(category));

  const copy = locale === "vi"
    ? {
        title: "Hướng dẫn chọn cỡ",
        eyebrow: "Vela Wear / Số đo tham khảo",
        intro: "Đối chiếu số đo cơ thể với bảng dưới đây. Phom và chất liệu của từng sản phẩm có thể tạo cảm giác mặc khác nhau.",
        back: "Quay lại sản phẩm",
        apparel: "Trang phục",
        shoes: "Giày",
        accessories: "Phụ kiện",
        standardTitle: "Bảng size XXS – XXL",
        plusTitle: "Bảng size mở rộng 0X – 4X",
        plusHint: "Mở bảng số đo mở rộng",
        international: "Quy đổi size quốc tế",
        shoeTitle: "Size giày và chiều dài bàn chân",
        accessoryTitle: "Size phụ kiện",
        reference: "Các số đo là số đo cơ thể tham khảo; form từng sản phẩm có thể khác.",
        available: "Cỡ đang có của sản phẩm được hiển thị rõ; các cỡ còn lại được làm mờ để tham khảo.",
        size: "Size",
        bust: "Ngực",
        waist: "Eo",
        hip: "Mông",
        euSize: "Size EU",
        footLength: "Chiều dài bàn chân",
        howToMeasure: "Cách đo chính xác",
        measureBust: "Ngực: quấn thước quanh phần đầy nhất, giữ thước song song với sàn.",
        measureWaist: "Eo: đo quanh điểm nhỏ nhất của eo tự nhiên, không siết thước.",
        measureHip: "Mông: đứng khép chân và đo quanh phần rộng nhất.",
        measureFoot: "Bàn chân: đứng trên giấy, đánh dấu gót và ngón dài nhất rồi đo khoảng cách.",
        sources: "Nguồn đối chiếu cách đo",
      }
    : {
        title: "Size guide",
        eyebrow: "Vela Wear / Reference measurements",
        intro: "Compare your body measurements with the tables below. Product fit and fabric may change how each item feels.",
        back: "Back to product",
        apparel: "Apparel",
        shoes: "Shoes",
        accessories: "Accessories",
        standardTitle: "Size chart XXS – XXL",
        plusTitle: "Extended size chart 0X – 4X",
        plusHint: "Open extended measurements",
        international: "International size conversion",
        shoeTitle: "Shoe size and foot length",
        accessoryTitle: "Accessory sizing",
        reference: "These are reference body measurements; individual product fits may vary.",
        available: "Available product sizes are emphasized; the remaining sizes stay visible as a reference.",
        size: "Size",
        bust: "Bust",
        waist: "Waist",
        hip: "Hip",
        euSize: "EU size",
        footLength: "Foot length",
        howToMeasure: "How to measure",
        measureBust: "Bust: measure around the fullest part, keeping the tape parallel to the floor.",
        measureWaist: "Waist: measure around the narrowest natural point without pulling the tape tight.",
        measureHip: "Hip: stand with feet together and measure around the fullest point.",
        measureFoot: "Foot: stand on paper, mark the heel and longest toe, then measure the distance.",
        sources: "Measurement references",
      };

  const tabs: Array<{ id: GuideSection; label: string; icon: typeof Shirt }> = [
    { id: "apparel", label: copy.apparel, icon: Shirt },
    { id: "shoes", label: copy.shoes, icon: Footprints },
    { id: "accessories", label: copy.accessories, icon: SlidersHorizontal },
  ];
  const productHref = productSlug && /^[a-z0-9-]+$/i.test(productSlug)
    ? `/products/${encodeURIComponent(productSlug)}`
    : "/collection";

  return (
    <main className="mx-auto min-h-[calc(100vh-160px)] w-full max-w-[1600px] px-6 pb-24 pt-[104px] md:px-16 md:pt-[120px]">
      <Link href={productHref} className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1c1a18]/60 hover:text-[#b5573a]">
        <ArrowLeft className="size-4" />
        {copy.back}
      </Link>

      <div className="flex flex-col justify-between gap-6 border-b border-[#1c1a18]/10 pb-8 md:flex-row md:items-end">
        <div className="max-w-3xl">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#b5573a]">{copy.eyebrow}</p>
          <h1 className="font-serif text-4xl font-light tracking-tight text-[#1c1a18] md:text-6xl">{copy.title}</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#1c1a18]/65">{copy.intro}</p>
        </div>
        <SizeUnitToggle unit={unit} onChange={setUnit} />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {[
          copy.measureBust,
          copy.measureWaist,
          copy.measureHip,
          copy.measureFoot,
        ].map((instruction, index) => (
          <div key={instruction} className="border-l-2 border-[#b5573a] bg-white/35 px-4 py-4">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1c1a18]/45">
              {index === 3 ? <Footprints className="size-4" /> : <Ruler className="size-4" />}
              {copy.howToMeasure}
            </div>
            <p className="text-xs leading-6 text-[#1c1a18]/70">{instruction}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-2 border-b border-[#1c1a18]/10" role="tablist" aria-label={copy.title}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeSection === tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 border-b-2 px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em]",
                activeSection === tab.id
                  ? "border-[#b5573a] text-[#1c1a18]"
                  : "border-transparent text-[#1c1a18]/45 hover:text-[#1c1a18]",
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeSection === "apparel" && (
        <div role="tabpanel" className="mt-12 space-y-16">
          <section>
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="font-serif text-3xl font-light text-[#1c1a18]">{copy.standardTitle}</h2>
                <p className="mt-2 text-xs text-[#1c1a18]/50">{copy.reference}</p>
                {availableSizes.size > 0 && <p className="mt-1 text-xs text-[#b5573a]">{copy.available}</p>}
              </div>
              <SizeUnitToggle unit={unit} onChange={setUnit} />
            </div>
            <BodyMeasurementTable
              sizes={STANDARD_BODY_SIZES}
              unit={unit}
              selectedSize={selectedSize}
              availableSizes={availableSizes}
              labels={copy}
            />
          </section>

          <details className="group border-y border-[#1c1a18]/10 py-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-3xl font-light text-[#1c1a18]">{copy.plusTitle}</h2>
                <p className="mt-2 text-xs text-[#1c1a18]/50">{copy.plusHint}</p>
              </div>
              <ChevronDown className="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-6">
              <BodyMeasurementTable
                sizes={PLUS_BODY_SIZES}
                unit={unit}
                selectedSize={selectedSize}
                availableSizes={availableSizes}
                labels={copy}
              />
            </div>
          </details>

          <section>
            <h2 className="mb-6 font-serif text-3xl font-light text-[#1c1a18]">{copy.international}</h2>
            <div className="overflow-x-auto border border-[#1c1a18]/10">
              <table className="w-full min-w-[820px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#1c1a18]/10">
                    <th className="px-5 py-5 text-left">{copy.size}</th>
                    {STANDARD_BODY_SIZES.map((item) => <th key={item.size} className="border-l border-[#1c1a18]/8 px-4 py-5 text-left">{item.size}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {INTERNATIONAL_SIZE_ROWS.map((row) => (
                    <tr key={row.label} className="border-b border-[#1c1a18]/10 last:border-0">
                      <th className="px-5 py-5 text-left">{row.label}</th>
                      {row.values.map((value, index) => <td key={`${row.label}-${STANDARD_BODY_SIZES[index].size}`} className="border-l border-[#1c1a18]/8 px-4 py-5">{value}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {activeSection === "shoes" && (
        <section role="tabpanel" className="mt-12">
          <div className="mb-6">
            <h2 className="font-serif text-3xl font-light text-[#1c1a18]">{copy.shoeTitle}</h2>
            <p className="mt-2 text-xs text-[#1c1a18]/50">{copy.reference}</p>
          </div>
          <div className="overflow-x-auto border border-[#1c1a18]/10">
            <table className="w-full min-w-[920px] border-collapse text-sm">
              <tbody>
                <tr className="border-b border-[#1c1a18]/10">
                  <th className="sticky left-0 bg-[#f7f4ef] px-5 py-5 text-left">{copy.euSize}</th>
                  {SHOE_SIZES.map((shoe) => (
                    <td key={shoe.eu} className={cn(
                      "border-l border-[#1c1a18]/8 px-5 py-5 font-semibold",
                      selectedSize === shoe.eu && "bg-[#f1dfd6] text-[#8f402a]",
                      availableSizes.size > 0 && !availableSizes.has(shoe.eu) && selectedSize !== shoe.eu && "text-[#1c1a18]/30",
                    )}>{shoe.eu}</td>
                  ))}
                </tr>
                <tr>
                  <th className="sticky left-0 bg-[#f7f4ef] px-5 py-5 text-left">{copy.footLength} ({unit})</th>
                  {SHOE_SIZES.map((shoe) => <td key={shoe.eu} className="border-l border-[#1c1a18]/8 px-5 py-5">{formatMeasurement(shoe.footLengthCm, unit)}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeSection === "accessories" && (
        <section role="tabpanel" className="mt-12">
          <h2 className="mb-6 font-serif text-3xl font-light text-[#1c1a18]">{copy.accessoryTitle}</h2>
          <div className="grid gap-px overflow-hidden border border-[#1c1a18]/10 bg-[#1c1a18]/10 sm:grid-cols-2">
            {ACCESSORY_SIZE_NOTES.map((note) => (
              <article key={note.size} className={cn(
                "bg-[#f7f4ef] p-6",
                selectedSize === note.size && "bg-[#f1dfd6]",
                availableSizes.size > 0 && !availableSizes.has(note.size) && selectedSize !== note.size && "opacity-45",
              )}>
                <h3 className="text-sm font-semibold tracking-[0.1em]">{note.size}</h3>
                <p className="mt-3 text-xs leading-6 text-[#1c1a18]/65">{note[locale]}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <footer className="mt-16 border-t border-[#1c1a18]/10 pt-8 text-xs leading-6 text-[#1c1a18]/55">
        <p className="font-semibold uppercase tracking-[0.14em] text-[#1c1a18]/70">{copy.sources}</p>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          <a href="https://www.hm.com/cr/customer-service/sizeguide/ladies/" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-[#b5573a]">H&amp;M Size Guide</a>
          <a href="https://www.nike.com/gb/size-fit/mens-footwear" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-[#b5573a]">Nike Footwear Size Chart</a>
        </div>
      </footer>
    </main>
  );
}
