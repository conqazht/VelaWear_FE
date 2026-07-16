export type MeasurementUnit = "cm" | "in";
export type MeasurementRange = readonly [number, number];

export type BodySize = {
  size: string;
  bust: MeasurementRange;
  waist: MeasurementRange;
  hip: MeasurementRange;
};

export const STANDARD_BODY_SIZES: BodySize[] = [
  { size: "XXS", bust: [70, 76], waist: [54, 60], hip: [78, 84] },
  { size: "XS", bust: [76, 83], waist: [60, 67], hip: [84, 91] },
  { size: "S", bust: [83, 90], waist: [67, 74], hip: [91, 98] },
  { size: "M", bust: [90, 97], waist: [74, 81], hip: [98, 105] },
  { size: "L", bust: [97, 104], waist: [81, 88], hip: [105, 112] },
  { size: "XL", bust: [104, 114], waist: [88, 98], hip: [112, 120] },
  { size: "XXL", bust: [114, 124], waist: [98, 108], hip: [120, 128] },
];

export const PLUS_BODY_SIZES: BodySize[] = [
  { size: "0X", bust: [112, 119], waist: [101.5, 108.5], hip: [122.5, 129.5] },
  { size: "1X", bust: [119, 126], waist: [108.5, 115.5], hip: [129.5, 136.5] },
  { size: "2X", bust: [126, 133], waist: [115.5, 124], hip: [136.5, 145] },
  { size: "3X", bust: [133, 140], waist: [124, 134], hip: [145, 155] },
  { size: "4X", bust: [140, 147], waist: [134, 144], hip: [155, 165] },
];

export const INTERNATIONAL_SIZE_ROWS = [
  { label: "US", values: ["0", "0–2", "4–6", "8–10", "12–14", "16–18", "20–22"] },
  { label: "UK", values: ["4", "6", "8", "10", "12", "14–16", "18–20"] },
  { label: "EU", values: ["32", "34", "36", "38", "40", "42–44", "46–48"] },
] as const;

export const SHOE_SIZES = [
  { eu: "35", footLengthCm: 22.0 },
  { eu: "36", footLengthCm: 22.6 },
  { eu: "37", footLengthCm: 23.1 },
  { eu: "38", footLengthCm: 23.7 },
  { eu: "39", footLengthCm: 24.2 },
  { eu: "40", footLengthCm: 24.8 },
  { eu: "41", footLengthCm: 25.3 },
  { eu: "42", footLengthCm: 25.9 },
  { eu: "43", footLengthCm: 26.4 },
  { eu: "44", footLengthCm: 27.0 },
  { eu: "45", footLengthCm: 27.5 },
  { eu: "46", footLengthCm: 28.0 },
] as const;

export const ACCESSORY_SIZE_NOTES = [
  {
    size: "ONE SIZE",
    vi: "Một kích cỡ tiêu chuẩn. Kiểm tra số đo cụ thể trong mô tả từng sản phẩm.",
    en: "One standard size. Check the product description for item-specific measurements.",
  },
  {
    size: "ADJUSTABLE",
    vi: "Có thể điều chỉnh bằng khóa, dây hoặc nấc cài trong phạm vi của sản phẩm.",
    en: "Adjustable with the product's buckle, strap, or fastening positions.",
  },
  {
    size: "REGULAR",
    vi: "Phom phụ kiện tiêu chuẩn, phù hợp nhu cầu sử dụng hằng ngày.",
    en: "A regular accessory fit intended for everyday use.",
  },
  {
    size: "LARGE",
    vi: "Phiên bản lớn hơn Regular; xem kích thước dài/rộng trong chi tiết sản phẩm.",
    en: "Larger than Regular; see the product detail for length and width.",
  },
] as const;

export function formatMeasurement(
  value: number | MeasurementRange,
  unit: MeasurementUnit,
): string {
  const convert = (centimeters: number) =>
    unit === "cm"
      ? Number.isInteger(centimeters) ? String(centimeters) : String(centimeters)
      : (centimeters / 2.54).toFixed(1);

  return Array.isArray(value)
    ? `${convert(value[0])}–${convert(value[1])}`
    : convert(value as number);
}

export function createSizeGuideHref({
  categorySlug,
  selectedSize,
  productSlug,
  availableSizes,
}: {
  categorySlug?: string;
  selectedSize?: string;
  productSlug?: string;
  availableSizes?: string[];
}): string {
  const params = new URLSearchParams();
  if (categorySlug) params.set("category", categorySlug);
  if (selectedSize) params.set("size", selectedSize);
  if (productSlug) params.set("product", productSlug);
  if (availableSizes && availableSizes.length > 0) {
    params.set("available", Array.from(new Set(availableSizes)).join(","));
  }
  const query = params.toString();
  return query ? `/size-guide?${query}` : "/size-guide";
}

export function parseAvailableSizes(value: string | null): Set<string> {
  if (!value) return new Set();
  return new Set(
    value
      .split(",")
      .map((size) => size.trim().toLocaleUpperCase())
      .filter(Boolean),
  );
}
