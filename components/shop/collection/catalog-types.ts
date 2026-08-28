import type { StorefrontCatalogResult } from "@/lib/api/types";
import type { ApiErrorClassification } from "@/lib/api/errors";
import type { CatalogUrlState } from "@/lib/storefront-catalog";

export type CatalogMode = "collection" | "search";

export type CatalogRollback = {
  query: string;
  error: ApiErrorClassification;
};

export type CatalogCopy = {
  selected: string;
  noOptions: string;
  priceError: string;
  staleWarning: string;
  invalidRequestWarning: string;
  retry: string;
  previous: string;
  next: string;
  page: string;
  viewProducts: (count: number) => string;
};

export function getCatalogCopy(locale: "vi" | "en"): CatalogCopy {
  return locale === "vi"
    ? {
        selected: "Đang lọc",
        noOptions: "Chưa có tùy chọn phù hợp.",
        priceError: "Giá tối thiểu không được lớn hơn giá tối đa.",
        staleWarning: "Dữ liệu mới chưa tải được. Bạn vẫn đang xem kết quả gần nhất.",
        invalidRequestWarning: "Bộ lọc vừa chọn không hợp lệ. Kết quả gần nhất vẫn được giữ lại.",
        retry: "Thử lại",
        previous: "Trang trước",
        next: "Trang sau",
        page: "Trang",
        viewProducts: (count) => `Xem ${count} sản phẩm`,
      }
    : {
        selected: "Active filters",
        noOptions: "No matching options yet.",
        priceError: "Minimum price cannot exceed maximum price.",
        staleWarning:
          "Fresh data could not be loaded. The latest available results remain visible.",
        invalidRequestWarning:
          "That filter request is invalid. The latest available results remain visible.",
        retry: "Retry",
        previous: "Previous page",
        next: "Next page",
        page: "Page",
        viewProducts: (count) => `View ${count} products`,
      };
}

export type FilterProps = {
  state: CatalogUrlState;
  facets: StorefrontCatalogResult["facets"];
  onChange: (next: CatalogUrlState) => void;
  onClear: () => void;
  priceError: string | null;
  setPriceError: (message: string | null) => void;
  isMobile?: boolean;
};

export type ActiveFiltersProps = {
  state: CatalogUrlState;
  facets: StorefrontCatalogResult["facets"];
  onChange: (next: CatalogUrlState) => void;
};

export type CatalogPaginationProps = {
  state: CatalogUrlState;
  pages: number;
  onPage: (page: number) => void;
};
