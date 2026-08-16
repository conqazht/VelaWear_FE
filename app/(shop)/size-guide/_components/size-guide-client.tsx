"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Footprints,
  Info,
  Ruler,
  Shirt,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import {
  ACCESSORY_SIZE_NOTES,
  formatMeasurement,
  INTERNATIONAL_SIZE_ROWS,
  PLUS_BODY_SIZES,
  SHOE_SIZES,
  STANDARD_BODY_SIZES,
  type BodySize,
  type MeasurementUnit,
} from "../_data/size-guide-data";

type GuideSection = "apparel" | "shoes" | "accessories";
type ApparelSubSection = "standard" | "plus" | "international";

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
  const { t } = useI18n();

  return (
    <div
      className="inline-flex rounded-full border border-[#1c1a18]/15 bg-[#efe7dc] p-1 shadow-2xs"
      role="group"
      aria-label={t("storefront.sizeGuide.unitAria")}
    >
      {(["in", "cm"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={unit === option}
          className={cn(
            "min-w-14 cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase transition-all active:scale-[0.96]",
            unit === option
              ? "border border-[#1c1a18]/15 bg-white font-bold text-[#1c1a18] shadow-xs"
              : "text-[#1c1a18]/65 hover:text-[#1c1a18]",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function HighContrastBodyTable({
  sizes,
  unit,
  selectedSize,
  labels,
}: {
  sizes: BodySize[];
  unit: MeasurementUnit;
  selectedSize: string;
  labels: { size: string; bust: string; waist: string; hip: string };
}) {
  const rows: Array<{ key: "bust" | "waist" | "hip"; label: string }> = [
    { key: "bust", label: labels.bust },
    { key: "waist", label: labels.waist },
    { key: "hip", label: labels.hip },
  ];

  return (
    <div className="max-w-4xl overflow-x-auto rounded-xl border border-[#1c1a18]/15 bg-white shadow-xs">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[#1c1a18]/15 bg-[#efe7dc]/80">
            <th className="sticky left-0 z-10 w-36 min-w-32 border-r border-[#1c1a18]/12 bg-[#efe7dc] px-4 py-3 text-left text-xs font-bold tracking-wider text-[#1c1a18] uppercase">
              {labels.size}
            </th>
            {sizes.map((size) => {
              const normalized = size.size.toLocaleUpperCase();
              const isSelected = selectedSize === normalized;

              return (
                <th
                  key={size.size}
                  className={cn(
                    "min-w-16 border-l border-[#1c1a18]/10 px-3 py-3 text-center text-xs font-bold tracking-wider transition-colors md:min-w-20",
                    isSelected
                      ? "bg-[#efe7dc] text-[#b5573a] ring-1 ring-[#b5573a] ring-inset"
                      : "bg-[#efe7dc]/60 text-[#1c1a18]",
                  )}
                >
                  {size.size}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.key}
              className={cn(
                "border-b border-[#1c1a18]/10 transition-colors last:border-0 hover:bg-[#efe7dc]/30",
                index % 2 === 1 ? "bg-[#faf8f5]" : "bg-white",
              )}
            >
              <th className="sticky left-0 z-10 border-r border-[#1c1a18]/10 bg-inherit px-4 py-3 text-left text-xs font-bold text-[#1c1a18]">
                {row.label} <span className="font-normal text-[#55423d]/70">({unit})</span>
              </th>
              {sizes.map((size) => {
                const normalized = size.size.toLocaleUpperCase();
                const isSelected = selectedSize === normalized;

                return (
                  <td
                    key={`${size.size}-${row.key}`}
                    className={cn(
                      "font-numeric min-w-16 border-l border-[#1c1a18]/10 px-3 py-3 text-center text-sm font-semibold tabular-nums md:min-w-20",
                      isSelected ? "bg-[#efe7dc]/60 font-bold text-[#b5573a]" : "text-[#1c1a18]",
                    )}
                  >
                    {formatMeasurement(size[row.key], unit)}
                  </td>
                );
              })}
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
  const [unit, setUnit] = useState<MeasurementUnit>("cm");
  const [activeSection, setActiveSection] = useState<GuideSection>(() =>
    guideSectionForCategory(category),
  );
  const [apparelSubSection, setApparelSubSection] = useState<ApparelSubSection>("standard");

  const copy =
    locale === "vi"
      ? {
          title: "Hướng dẫn chọn cỡ",
          eyebrow: "Vela Wear / Bảng Số Đo Chuẩn",
          intro:
            "Đối chiếu số đo cơ thể với bảng kích cỡ chuẩn bên dưới để chọn trang phục vừa vặn nhất. Phom dáng và chất liệu vải của từng dòng sản phẩm có thể tạo cảm giác mặc linh hoạt.",
          back: "Quay lại sản phẩm",
          apparel: "Trang phục",
          shoes: "Giày dép",
          accessories: "Phụ kiện",
          subStandard: "Cỡ chuẩn (XXS – XXL)",
          subPlus: "Cỡ mở rộng (0X – 4X)",
          subInternational: "Quy đổi quốc tế (US/UK/EU)",
          standardTitle: "Bảng kích cỡ chuẩn XXS – XXL",
          plusTitle: "Bảng kích cỡ mở rộng 0X – 4X",
          international: "Bảng quy đổi kích cỡ quốc tế",
          shoeTitle: "Kích cỡ giày & Chiều dài bàn chân",
          accessoryTitle: "Kích cỡ & Thông số phụ kiện",
          reference:
            "Số đo hiển thị là kích cỡ cơ thể tiêu chuẩn; độ co giãn phụ thuộc vào từng chất liệu vải.",
          size: "Kích cỡ",
          bust: "Vòng ngực",
          waist: "Vòng eo",
          hip: "Vòng mông",
          euSize: "Cỡ EU",
          footLength: "Chiều dài bàn chân",
          howToMeasureTitle: "Hướng dẫn lấy số đo chuẩn",
          howToMeasureSub: "Dùng thước dây mềm để đo trực tiếp trên cơ thể",
          step1: "Vòng ngực",
          step1Desc:
            "Quấn thước quanh phần đầy nhất của ngực, giữ thước phẳng và song song với sàn.",
          step2: "Vòng eo",
          step2Desc:
            "Đo quanh điểm nhỏ nhất của eo tự nhiên (khoảng trên rốn 2-3cm), không siết quá chặt.",
          step3: "Vòng mông",
          step3Desc: "Đứng thẳng khép chân và đo quanh phần nở nhất của vòng 3.",
          step4: "Bàn chân",
          step4Desc:
            "Đặt chân lên tờ giấy, đánh dấu từ gót đến ngón chân dài nhất rồi đo chiều dài.",
        }
      : {
          title: "Size guide",
          eyebrow: "Vela Wear / Reference Measurements",
          intro:
            "Compare your body measurements with our standard tables below to find your perfect fit. Product fit and stretch may vary depending on material.",
          back: "Back to product",
          apparel: "Apparel",
          shoes: "Shoes",
          accessories: "Accessories",
          subStandard: "Standard (XXS – XXL)",
          subPlus: "Plus Size (0X – 4X)",
          subInternational: "International (US/UK/EU)",
          standardTitle: "Standard size chart XXS – XXL",
          plusTitle: "Extended size chart 0X – 4X",
          international: "International size conversion",
          shoeTitle: "Shoe sizing & Foot length",
          accessoryTitle: "Accessory sizing & specifications",
          reference:
            "Values shown are body measurements; fabric drape and elasticity may vary across collections.",
          size: "Size",
          bust: "Bust",
          waist: "Waist",
          hip: "Hip",
          euSize: "EU Size",
          footLength: "Foot length",
          howToMeasureTitle: "How to take accurate measurements",
          howToMeasureSub: "Use a soft tape measure held comfortably without pulling tight",
          step1: "Bust",
          step1Desc:
            "Measure around the fullest part of your chest, keeping the tape horizontal to the ground.",
          step2: "Waist",
          step2Desc: "Measure around your natural waistline (the narrowest point above your hips).",
          step3: "Hip",
          step3Desc:
            "Stand with feet together and measure around the fullest part of your hips/seat.",
          step4: "Foot Length",
          step4Desc: "Stand on paper, mark your heel and longest toe, then measure the distance.",
        };

  const tabs: Array<{ id: GuideSection; label: string; icon: typeof Shirt }> = [
    { id: "apparel", label: copy.apparel, icon: Shirt },
    { id: "shoes", label: copy.shoes, icon: Footprints },
    { id: "accessories", label: copy.accessories, icon: SlidersHorizontal },
  ];

  const measureSteps = [
    { num: "01", title: copy.step1, desc: copy.step1Desc, icon: Shirt },
    { num: "02", title: copy.step2, desc: copy.step2Desc, icon: Ruler },
    { num: "03", title: copy.step3, desc: copy.step3Desc, icon: Sparkles },
    { num: "04", title: copy.step4, desc: copy.step4Desc, icon: Footprints },
  ];

  const productHref =
    productSlug && /^[a-z0-9-]+$/i.test(productSlug)
      ? `/products/${encodeURIComponent(productSlug)}`
      : "/collection";

  return (
    <main className="mx-auto min-h-[calc(100vh-160px)] w-full max-w-[1320px] px-6 pt-[104px] pb-24 md:px-16 md:pt-[120px]">
      {/* Back Link */}
      <Link
        href={productHref}
        className="mb-8 inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-[#1c1a18]/70 uppercase transition-colors hover:text-[#b5573a]"
      >
        <ArrowLeft className="size-4" />
        {copy.back}
      </Link>

      {/* Hero Header with SINGLE Unit Toggle */}
      <div className="flex flex-col justify-between gap-6 border-b border-[#1c1a18]/12 pb-8 md:flex-row md:items-end">
        <div className="max-w-3xl">
          <p className="mb-2.5 text-[10px] font-bold tracking-[0.25em] text-[#b5573a] uppercase">
            {copy.eyebrow}
          </p>
          <h1 className="font-serif text-3xl font-light tracking-tight text-[#1c1a18] md:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-4 max-w-2xl text-xs leading-relaxed font-normal text-[#55423d]/80 md:text-sm">
            {copy.intro}
          </p>
        </div>
        {/* Single canonical unit toggle */}
        <div className="shrink-0">
          <SizeUnitToggle unit={unit} onChange={setUnit} />
        </div>
      </div>

      {/* Unified Elegant "How to Measure" Card */}
      <div className="mt-8 max-w-5xl rounded-2xl border border-[#1c1a18]/12 bg-white p-6 shadow-xs md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-[#1c1a18]/10 pb-4">
          <div className="flex items-center gap-2.5">
            <Ruler className="size-4 text-[#b5573a]" />
            <h2 className="text-xs font-bold tracking-[0.16em] text-[#1c1a18] uppercase">
              {copy.howToMeasureTitle}
            </h2>
          </div>
          <span className="text-xs font-medium text-[#55423d]/70">{copy.howToMeasureSub}</span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {measureSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="flex flex-col gap-2 rounded-xl border border-[#1c1a18]/8 bg-[#faf8f5] p-4.5"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-6 items-center justify-center rounded-full bg-[#efe7dc] text-[11px] font-bold text-[#b5573a]">
                    {step.num}
                  </span>
                  <Icon className="size-4 text-[#55423d]/50" />
                </div>
                <h3 className="mt-1 text-xs font-bold tracking-wider text-[#1c1a18] uppercase">
                  {step.title}
                </h3>
                <p className="text-xs leading-relaxed text-[#55423d]/85">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Category Tabs */}
      <div
        className="mt-10 flex flex-wrap gap-2 border-b border-[#1c1a18]/12"
        role="tablist"
        aria-label={copy.title}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveSection(tab.id)}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 border-b-2 px-6 py-4 text-xs font-bold tracking-[0.14em] uppercase transition-all",
                isActive
                  ? "border-[#b5573a] text-[#b5573a]"
                  : "border-transparent text-[#1c1a18]/55 hover:border-[#1c1a18]/25 hover:text-[#1c1a18]",
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* APPAREL SECTION */}
      {activeSection === "apparel" && (
        <div role="tabpanel" className="mt-8 space-y-8">
          {/* Sub-Section Switcher for Apparel */}
          <div className="flex max-w-4xl flex-wrap items-center justify-between gap-4">
            <div className="inline-flex rounded-full border border-[#1c1a18]/12 bg-[#efe7dc]/70 p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setApparelSubSection("standard")}
                className={cn(
                  "cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold tracking-wider uppercase transition-all active:scale-[0.96]",
                  apparelSubSection === "standard"
                    ? "border border-[#1c1a18]/12 bg-white font-bold text-[#1c1a18] shadow-xs"
                    : "text-[#1c1a18]/65 hover:text-[#1c1a18]",
                )}
              >
                {copy.subStandard}
              </button>
              <button
                type="button"
                onClick={() => setApparelSubSection("plus")}
                className={cn(
                  "cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold tracking-wider uppercase transition-all active:scale-[0.96]",
                  apparelSubSection === "plus"
                    ? "border border-[#1c1a18]/12 bg-white font-bold text-[#1c1a18] shadow-xs"
                    : "text-[#1c1a18]/65 hover:text-[#1c1a18]",
                )}
              >
                {copy.subPlus}
              </button>
              <button
                type="button"
                onClick={() => setApparelSubSection("international")}
                className={cn(
                  "cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold tracking-wider uppercase transition-all active:scale-[0.96]",
                  apparelSubSection === "international"
                    ? "border border-[#1c1a18]/12 bg-white font-bold text-[#1c1a18] shadow-xs"
                    : "text-[#1c1a18]/65 hover:text-[#1c1a18]",
                )}
              >
                {copy.subInternational}
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium text-[#55423d]/75">
              <Info className="size-3.5 text-[#b5573a]" />
              <span>{copy.reference}</span>
            </div>
          </div>

          {/* Standard Apparel Table */}
          {apparelSubSection === "standard" && (
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-light text-[#1c1a18]">
                {copy.standardTitle}
              </h2>
              <HighContrastBodyTable
                sizes={STANDARD_BODY_SIZES}
                unit={unit}
                selectedSize={selectedSize}
                labels={copy}
              />
            </section>
          )}

          {/* Plus Size Apparel Table */}
          {apparelSubSection === "plus" && (
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-light text-[#1c1a18]">{copy.plusTitle}</h2>
              <HighContrastBodyTable
                sizes={PLUS_BODY_SIZES}
                unit={unit}
                selectedSize={selectedSize}
                labels={copy}
              />
            </section>
          )}

          {/* International Size Conversion */}
          {apparelSubSection === "international" && (
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-light text-[#1c1a18]">
                {copy.international}
              </h2>
              <div className="max-w-4xl overflow-x-auto rounded-xl border border-[#1c1a18]/15 bg-white shadow-xs">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[#1c1a18]/15 bg-[#efe7dc]/80">
                      <th className="sticky left-0 z-10 w-36 min-w-32 border-r border-[#1c1a18]/12 bg-[#efe7dc] px-4 py-3 text-left text-xs font-bold tracking-wider text-[#1c1a18] uppercase">
                        {copy.size}
                      </th>
                      {STANDARD_BODY_SIZES.map((item) => (
                        <th
                          key={item.size}
                          className="min-w-16 border-l border-[#1c1a18]/12 px-3 py-3 text-center text-xs font-bold tracking-wider text-[#1c1a18] md:min-w-20"
                        >
                          {item.size}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {INTERNATIONAL_SIZE_ROWS.map((row, index) => (
                      <tr
                        key={row.label}
                        className={cn(
                          "border-b border-[#1c1a18]/10 transition-colors last:border-0 hover:bg-[#efe7dc]/30",
                          index % 2 === 1 ? "bg-[#faf8f5]" : "bg-white",
                        )}
                      >
                        <th className="sticky left-0 z-10 border-r border-[#1c1a18]/10 bg-inherit px-4 py-3 text-left text-xs font-bold text-[#1c1a18]">
                          {row.label}
                        </th>
                        {row.values.map((value, valIdx) => (
                          <td
                            key={`${row.label}-${STANDARD_BODY_SIZES[valIdx].size}`}
                            className="font-numeric border-l border-[#1c1a18]/10 px-3 py-3 text-center text-sm font-semibold text-[#1c1a18] tabular-nums"
                          >
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}

      {/* SHOES SECTION */}
      {activeSection === "shoes" && (
        <section role="tabpanel" className="mt-8 space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-light text-[#1c1a18]">{copy.shoeTitle}</h2>
            <p className="mt-1.5 text-xs font-medium text-[#55423d]/75">{copy.reference}</p>
          </div>

          <div className="max-w-5xl overflow-x-auto rounded-xl border border-[#1c1a18]/15 bg-white shadow-xs">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#1c1a18]/15 bg-[#efe7dc]/80">
                  <th className="sticky left-0 z-10 w-36 min-w-32 border-r border-[#1c1a18]/12 bg-[#efe7dc] px-4 py-3 text-left text-xs font-bold tracking-wider text-[#1c1a18] uppercase">
                    {copy.euSize}
                  </th>
                  {SHOE_SIZES.map((shoe) => {
                    const isSelected = selectedSize === shoe.eu;
                    return (
                      <th
                        key={shoe.eu}
                        className={cn(
                          "min-w-14 border-l border-[#1c1a18]/12 px-2.5 py-3 text-center text-xs font-bold tracking-wider transition-colors md:min-w-16",
                          isSelected
                            ? "bg-[#efe7dc] text-[#b5573a] ring-1 ring-[#b5573a] ring-inset"
                            : "bg-[#efe7dc]/60 text-[#1c1a18]",
                        )}
                      >
                        {shoe.eu}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white transition-colors hover:bg-[#efe7dc]/30">
                  <th className="sticky left-0 z-10 border-r border-[#1c1a18]/10 bg-inherit px-4 py-3 text-left text-xs font-bold text-[#1c1a18]">
                    {copy.footLength}{" "}
                    <span className="font-normal text-[#55423d]/70">({unit})</span>
                  </th>
                  {SHOE_SIZES.map((shoe) => {
                    const isSelected = selectedSize === shoe.eu;
                    return (
                      <td
                        key={shoe.eu}
                        className={cn(
                          "font-numeric border-l border-[#1c1a18]/10 px-2.5 py-3 text-center text-sm font-semibold tabular-nums",
                          isSelected
                            ? "bg-[#efe7dc]/60 font-bold text-[#b5573a]"
                            : "text-[#1c1a18]",
                        )}
                      >
                        {formatMeasurement(shoe.footLengthCm, unit)}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ACCESSORIES SECTION */}
      {activeSection === "accessories" && (
        <section role="tabpanel" className="mt-8 space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-light text-[#1c1a18]">{copy.accessoryTitle}</h2>
            <p className="mt-1.5 text-xs font-medium text-[#55423d]/75">{copy.reference}</p>
          </div>

          <div className="grid max-w-4xl gap-4 sm:grid-cols-2">
            {ACCESSORY_SIZE_NOTES.map((note) => {
              const isSelected = selectedSize === note.size;
              return (
                <article
                  key={note.size}
                  className={cn(
                    "rounded-xl border p-6 shadow-xs transition-all",
                    isSelected
                      ? "border-[#b5573a] bg-[#efe7dc]/60 ring-1 ring-[#b5573a]"
                      : "border-[#1c1a18]/12 bg-white hover:border-[#1c1a18]/30",
                  )}
                >
                  <h3 className="font-mono text-sm font-bold tracking-wider text-[#1c1a18]">
                    {note.size}
                  </h3>
                  <p className="mt-3 text-xs leading-relaxed font-normal text-[#55423d]/85">
                    {note[locale]}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
