import type { Locale } from "@/lib/i18n";
import { createCatalogHref } from "@/lib/storefront-catalog";

export type StorefrontNavigationLeaf = {
  label: string;
  href: string;
};

export type StorefrontNavigationGroup = {
  title: string;
  items: StorefrontNavigationLeaf[];
};

export type StorefrontNavigationItem = {
  label: string;
  href: string;
  ctaLabel?: string;
  description?: string;
  groups?: StorefrontNavigationGroup[];
};

type LocalizedLeaf = {
  vi: string;
  en: string;
  categories?: string[];
  qVi?: string;
  qEn?: string;
  sort?: "newest";
  href?: string;
};

function leaf(locale: Locale, item: LocalizedLeaf): StorefrontNavigationLeaf {
  if (item.href) return { label: item[locale], href: item.href };

  return {
    label: item[locale],
    href: createCatalogHref({
      categories: item.categories ?? [],
      q: locale === "vi" ? (item.qVi ?? "") : (item.qEn ?? item.qVi ?? ""),
      sort: item.sort ?? "featured",
    }),
  };
}

export function getStorefrontNavigation(locale: Locale): StorefrontNavigationItem[] {
  const labels =
    locale === "vi"
      ? {
          collection: "Bộ sưu tập",
          tops: "Áo",
          trousers: "Quần",
          dresses: "Váy & Đầm",
          accessories: "Phụ kiện & Giày",
          help: "Trợ giúp",
          sale: "Giảm giá",
          offer: "Ưu đãi",
          explore: "Khám phá",
          materials: "Chất liệu & phong cách",
          essentials: "Thiết yếu",
          knitwear: "Dệt kim",
          jackets: "Áo khoác",
          trousersGroup: "Kiểu quần & Chất liệu",
          trousersFitGroup: "Phom dáng & Phong cách",
          skirts: "Váy",
          dressesGroup: "Đầm",
          shoes: "Giày",
          accessoriesGroup: "Phụ kiện",
          all: "Xem tất cả",
        }
      : {
          collection: "Collection",
          tops: "Tops",
          trousers: "Trousers",
          dresses: "Skirts & Dresses",
          accessories: "Accessories & Shoes",
          help: "Help",
          sale: "Sale",
          offer: "Offers",
          explore: "Explore",
          materials: "Materials & style",
          essentials: "Essentials",
          knitwear: "Knitwear",
          jackets: "Outerwear",
          trousersGroup: "Styles & Fabrics",
          trousersFitGroup: "Fits & Occasions",
          skirts: "Skirts",
          dressesGroup: "Dresses",
          shoes: "Shoes",
          accessoriesGroup: "Accessories",
          all: "View all",
        };

  const descriptions =
    locale === "vi"
      ? {
          sale: "Ưu đãi theo mùa và những thiết kế chọn lọc đang chờ bạn.",
          collection: "Khám phá thiết kế mới, chất liệu đặc trưng và những phom dáng tinh tuyển.",
          tops: "Những lớp áo linh hoạt, từ thiết yếu hằng ngày đến may đo chỉn chu.",
          trousers: "Phom quần cân bằng giữa chuyển động tự nhiên và đường nét thanh lịch.",
          dresses: "Váy và đầm được chọn theo độ rủ, tỷ lệ và nhịp chuyển động.",
          accessories: "Hoàn thiện trang phục bằng giày và phụ kiện có chủ đích.",
        }
      : {
          sale: "Seasonal offers and selected designs, considered for the moment.",
          collection: "Discover new designs, signature materials, and considered silhouettes.",
          tops: "Versatile layers, from everyday essentials to refined tailoring.",
          trousers: "Trouser shapes balancing natural movement with polished lines.",
          dresses: "Skirts and dresses selected for drape, proportion, and movement.",
          accessories: "Complete each look with purposeful shoes and accessories.",
        };

  const makeGroup = (title: string, items: LocalizedLeaf[]): StorefrontNavigationGroup => ({
    title,
    items: items.map((item) => leaf(locale, item)),
  });

  return [
    {
      label: labels.sale,
      href: "/sale",
      ctaLabel: `${labels.all} ${labels.sale.toLocaleLowerCase()}`,
      description: descriptions.sale,
      groups: [
        makeGroup(labels.offer, [
          { vi: "Tất cả ưu đãi", en: "All offers", href: "/sale" },
          { vi: "Flash Sale", en: "Flash Sale", href: "/flash-sale" },
        ]),
      ],
    },
    {
      label: labels.collection,
      href: "/collection",
      ctaLabel: `${labels.all} ${labels.collection.toLocaleLowerCase()}`,
      description: descriptions.collection,
      groups: [
        makeGroup(labels.explore, [
          { vi: "Tất cả sản phẩm", en: "All products" },
          { vi: "Mới về", en: "New arrivals", sort: "newest" },
          { vi: "Thiết yếu", en: "Essentials", qVi: "thiết yếu", qEn: "essential" },
        ]),
        makeGroup(labels.materials, [
          { vi: "Linen", en: "Linen", qVi: "linen", qEn: "linen" },
          { vi: "May đo", en: "Tailoring", qVi: "may đo", qEn: "tailored" },
          { vi: "Dệt kim & Len", en: "Knitwear & Wool", qVi: "len", qEn: "wool" },
        ]),
      ],
    },
    {
      label: labels.tops,
      href: createCatalogHref({ categories: ["ao", "ao-khoac"] }),
      ctaLabel: `${labels.all} ${labels.tops.toLocaleLowerCase()}`,
      description: descriptions.tops,
      groups: [
        makeGroup(labels.essentials, [
          { vi: "Áo thun", en: "T-shirts", categories: ["ao"], qVi: "áo thun", qEn: "tee" },
          { vi: "Polo", en: "Polo", categories: ["ao"], qVi: "polo", qEn: "polo" },
          { vi: "Sơ mi", en: "Shirts", categories: ["ao"], qVi: "sơ mi", qEn: "shirt" },
          { vi: "Blouse", en: "Blouses", categories: ["ao"], qVi: "blouse", qEn: "blouse" },
        ]),
        makeGroup(labels.knitwear, [
          { vi: "Áo len", en: "Sweaters", categories: ["ao"], qVi: "len", qEn: "sweater" },
          { vi: "Cardigan", en: "Cardigans", categories: ["ao"], qVi: "cardigan", qEn: "cardigan" },
          {
            vi: "Áo cổ lọ",
            en: "Turtlenecks",
            categories: ["ao"],
            qVi: "cổ lọ",
            qEn: "turtleneck",
          },
        ]),
        makeGroup(labels.jackets, [
          { vi: "Tất cả áo khoác", en: "All outerwear", categories: ["ao-khoac"] },
          {
            vi: "Blazer & Suit",
            en: "Blazers & Suits",
            categories: ["ao-khoac"],
            qVi: "blazer",
            qEn: "blazer",
          },
          {
            vi: "Trench & Overcoat",
            en: "Trench & Overcoats",
            categories: ["ao-khoac"],
            qVi: "trench",
            qEn: "trench",
          },
          {
            vi: "Bomber & Parka",
            en: "Bombers & Parkas",
            categories: ["ao-khoac"],
            qVi: "bomber",
            qEn: "bomber",
          },
        ]),
      ],
    },
    {
      label: labels.trousers,
      href: createCatalogHref({ categories: ["quan"] }),
      ctaLabel: `${labels.all} ${labels.trousers.toLocaleLowerCase()}`,
      description: descriptions.trousers,
      groups: [
        makeGroup(labels.trousersGroup, [
          { vi: "Tất cả quần", en: "All trousers", categories: ["quan"] },
          {
            vi: "Quần tây",
            en: "Tailored trousers",
            categories: ["quan"],
            qVi: "quần tây",
            qEn: "tailored",
          },
          {
            vi: "Quần linen",
            en: "Linen trousers",
            categories: ["quan"],
            qVi: "linen",
            qEn: "linen",
          },
          {
            vi: "Quần khaki & Chinos",
            en: "Chinos & Khakis",
            categories: ["quan"],
            qVi: "chinos",
            qEn: "chinos",
          },
          { vi: "Quần jeans", en: "Jeans", categories: ["quan"], qVi: "jeans", qEn: "jeans" },
        ]),
        makeGroup(labels.trousersFitGroup, [
          {
            vi: "Ống rộng",
            en: "Wide leg",
            categories: ["quan"],
            qVi: "ống rộng",
            qEn: "wide leg",
          },
          {
            vi: "Ống suông",
            en: "Straight fit",
            categories: ["quan"],
            qVi: "ống suông",
            qEn: "straight fit",
          },
          {
            vi: "Slim fit",
            en: "Slim fit",
            categories: ["quan"],
            qVi: "slim fit",
            qEn: "slim fit",
          },
          { vi: "Cargo", en: "Cargo", categories: ["quan"], qVi: "cargo", qEn: "cargo" },
          { vi: "Shorts", en: "Shorts", categories: ["quan"], qVi: "shorts", qEn: "shorts" },
        ]),
      ],
    },
    {
      label: labels.dresses,
      href: createCatalogHref({ categories: ["vay", "dam"] }),
      ctaLabel: `${labels.all} ${labels.dresses.toLocaleLowerCase()}`,
      description: descriptions.dresses,
      groups: [
        makeGroup(labels.skirts, [
          { vi: "Tất cả váy", en: "All skirts", categories: ["vay"] },
          { vi: "Váy midi", en: "Midi skirts", categories: ["vay"], qVi: "midi", qEn: "midi" },
          { vi: "Váy maxi", en: "Maxi skirts", categories: ["vay"], qVi: "maxi", qEn: "maxi" },
          {
            vi: "Váy bút chì",
            en: "Pencil skirts",
            categories: ["vay"],
            qVi: "bút chì",
            qEn: "pencil",
          },
        ]),
        makeGroup(labels.dressesGroup, [
          { vi: "Tất cả đầm", en: "All dresses", categories: ["dam"] },
          { vi: "Đầm linen", en: "Linen dresses", categories: ["dam"], qVi: "linen", qEn: "linen" },
          { vi: "Đầm midi", en: "Midi dresses", categories: ["dam"], qVi: "midi", qEn: "midi" },
          { vi: "Đầm maxi", en: "Maxi dresses", categories: ["dam"], qVi: "maxi", qEn: "maxi" },
          {
            vi: "Jumpsuit",
            en: "Jumpsuits",
            categories: ["dam"],
            qVi: "jumpsuit",
            qEn: "jumpsuit",
          },
        ]),
      ],
    },
    {
      label: labels.accessories,
      href: createCatalogHref({ categories: ["giay", "phu-kien"] }),
      ctaLabel: `${labels.all} ${labels.accessories.toLocaleLowerCase()}`,
      description: descriptions.accessories,
      groups: [
        makeGroup(labels.shoes, [
          { vi: "Tất cả giày", en: "All shoes", categories: ["giay"] },
          {
            vi: "Derby, Oxford & Loafer",
            en: "Derby, Oxford & Loafers",
            categories: ["giay"],
            qVi: "da",
            qEn: "leather",
          },
          {
            vi: "Sneaker & Slip-on",
            en: "Sneakers & Slip-ons",
            categories: ["giay"],
            qVi: "sneaker",
            qEn: "sneaker",
          },
          {
            vi: "Sandal & Mule",
            en: "Sandals & Mules",
            categories: ["giay"],
            qVi: "sandal",
            qEn: "sandal",
          },
        ]),
        makeGroup(labels.accessoriesGroup, [
          { vi: "Túi", en: "Bags", categories: ["phu-kien"], qVi: "túi", qEn: "bag" },
          { vi: "Ví", en: "Wallets", categories: ["phu-kien"], qVi: "ví", qEn: "wallet" },
          { vi: "Thắt lưng", en: "Belts", categories: ["phu-kien"], qVi: "thắt lưng", qEn: "belt" },
          { vi: "Vòng", en: "Bracelets", categories: ["phu-kien"], qVi: "vòng", qEn: "bracelet" },
          {
            vi: "Móc khóa",
            en: "Key hooks",
            categories: ["phu-kien"],
            qVi: "móc khóa",
            qEn: "key hook",
          },
        ]),
      ],
    },
    { label: labels.help, href: "/help" },
  ];
}
