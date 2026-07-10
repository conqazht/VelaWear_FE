export interface CartItem {
  id: string;
  name: string;
  price: number;
  color: string;
  size: string;
  image: string;
  quantity: number;
  variantId?: number;
}

export interface OrderSummary {
  orderId: number;
  orderCode: string;
  status: string;
  finalAmount: number;
  paymentStatus: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  badge?: string;
  color: string;
  size: string;
  description: string;
  realId?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  material?: string;
  care?: string;
  shortDescription?: string;
  images?: string[];
}

export const categoryLabels: Record<string, string> = {
  ALL: "Tất cả",
  AO: "Áo",
  QUAN: "Quần",
  "PHU KIEN": "Phụ kiện",
};

const englishCategoryLabels: Record<string, string> = {
  ALL: "All",
  AO: "Clothes",
  QUAN: "Trousers",
  "PHU KIEN": "Accessories",
};

const categoryFallbackLabels = {
  vi: "Phụ kiện",
  en: "Accessories",
} as const;

export function getCategoryLabel(
  category: string,
  locale: keyof typeof categoryFallbackLabels = "vi"
) {
  const labels = locale === "en" ? englishCategoryLabels : categoryLabels;

  return labels[category] ?? categoryFallbackLabels[locale];
}

export const categoryTabs = ["ALL", "AO", "QUAN", "PHU KIEN"];

export const money = (value: number) => {
  return `${value.toLocaleString("vi-VN")}đ`;
};

export const getProductById = (id: string) =>
  PRODUCTS.find((product) => product.id === id);

export const PRODUCTS: Product[] = [
  {
    id: "linen-blazer",
    name: "Linen Blend Blazer",
    price: 2450000,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCwRzAE6C185QzyiPxCpVjB15ObBSeOKabu2pDX2jtjCbTbeBZqlIWMfXtCkW3cIuCjgaYSQAIUMWMTpqCihesHuOM_YtttUXMe469suIteQ-q2RNfi6MNmbukPG747ouYpZq-jzJ75zPYVXA1kP4enS-NOjFwWOfMB-z1LSUPNFHhtKMMpeiWx7CtS5dgfN-_EfjAvCgxN8hdxayD8dsnAAUx91mkM9xDoSu6DUS01v59PW5xRuI81N4DOIe2cUXUeYHlAbxxxgMsJ",
    category: "AO",
    badge: "Seasonal Pick",
    color: "Sand",
    size: "M",
    description:
      "Meticulously tailored from an artisanal blend of European flax and organic cotton. It features double-needle detailing, structured yet soft shoulder pads, and raw horn buttons for a refined minimalist aesthetic.",
  },
  {
    id: "silk-blouse",
    name: "Silk Drape Blouse",
    price: 1800000,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCEIQP1onvFftdIpPdfA7kqAlQHAu_SknPhkK5aWLKs_qCZofjj9eJjMQ50OnceZ_K-9sqSJrMgZMiESDSuM9SpXP0ozbdO-mvi6w4tYkdgZ_uaMuqIqA6HstQyT7ZhWTmv250PRjHGzPRAMB_tra-1_71ox25I_64a8N9NdhHRVMs9HAiyZACTaboO61z-holquWMxK0CL0tW12dXdlYR_hYalde3HrqLDwtpCiR9xlRuEixHCMSH1WWZMzGZZMS5dBCUAme6_L4XJ",
    category: "AO",
    badge: "Most Loved",
    color: "Cream",
    size: "S",
    description:
      "A fluid silk crepe de chine blouse with soft shoulder pleating and back tie details. Effortless luxury designed for comfortable elegance.",
  },
  {
    id: "wide-trousers",
    name: "Wide Leg Trousers",
    price: 1440000,
    originalPrice: 1800000,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC58QFuYm347f2m7MjhHsd2uXYjt-dAaH4FjsDOYeZsr-qOhwJXqIyk23MD0kIBUVwEanSVmrqDRQpkHZaS3R5yj-CQpAM7EqJ25kHsgG83wEArI9LWdJzcnO7b4m2ino_YJD-85mAywT7I7e4xaxctAEuOR1onfiC54OCsvwQx3759F8qemesRZPIhVboGWkHj7sGqU6u53viMZWFo1YUa7pTdX6DakZQgBi8KNW_6a2D4cOEsYCW7Fq-qKGWBPXVtDbYR4PFpCFA7",
    category: "QUAN",
    badge: "Sale",
    color: "Terracotta",
    size: "M",
    description:
      "Tailored from Italian wool blend canvas with high rise, neat double pleats, and elegant long legs. Beautiful silhouette with a gorgeous, fluid drape.",
  },
  {
    id: "leather-tote",
    name: "Structured Leather Tote",
    price: 3200000,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDZZXOEtNU4X4Zg1abxbttZhHHgH7B7FQBM94YaLOrnaelQB_9fDtmKTdyzMCnEXY6iEgkmTh30vOMrJQUhG0StULSPxvnwcoylPo1T7ySAAVijYo2H1FJ3n767TvM6tFDXtjV70QGz5s1zSdA2T-qnM2BL2q2eXqE5rE7t7wYYb2ILKVuC356nb7BrAR2F8ydBVN1gOEtu8vxTrYPz5FPcI3i2v4QfzTGw2GY7WHjIL2yq2jiZzv7uri3fvSdrWOBjLNduC6YsLzXa",
    category: "PHU KIEN",
    badge: "New",
    color: "Tan",
    size: "OS",
    description:
      "Sleek and robust day tote made of premium smooth vegetable-tanned leather. Fits your tablet, notebook and daily essentials with ease.",
  },
  {
    id: "signature-hemp-tee",
    name: "Signature Hemp Tee",
    price: 1100000,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDfNYnfyjJqT5IK6-gECBXXaXH7OvMyrDVs0VDY1V2ugJ8EGaOI3QE6VHMt9FsgqadcUoGAHNPasTO1LUY3mT5X2-MxFdtSJMXEdQ4H6tYDuxJ1tMEg_j33_wvw7H4KCaD9Ugi9hbhwsc-wdmZKqyNs7W-zBAexhOEJPq_2O-C5NIqplH3fCe686i_B5zNOwUXCzhSdoOvmPTWUwKjXXlPeOBXkWCJIdS2Y1HmeIodoqCHpNvx0FPMn4s1hpPt2CYxTFbN--Uvdhsu4",
    category: "AO",
    color: "Grey",
    size: "M",
    description:
      "A minimalist, oversized grey t-shirt tailored from premium organic hemp and cotton blend. Offers exceptional breathability and structural weight.",
  },
  {
    id: "artisan-linen-overshirt",
    name: "Artisan Linen Over-Shirt",
    price: 2450000,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCSrgTdoRWZJbkKQzynjWGUgqd4EsHYX7DreGZITBty4xuDlf9gJsy3PWQB0NdIswRw4AuAUmKq8ZlVMrTFxg01FuRCizF37ctJit_hjK9z9xM-4KfO1hE78QpfMvQbZZJoHPO32FjLHZKfSNwVLOL4zeJ5-zppTV1MYVLVAleFQ-GSGMZYdvcuLHEMXwisK0pwBWT04_86wVnW7dn2-f5AJnzz3P0vQuC6Pi6t4RbDvX_h4RUXwH4BjI2YB-VA3SORr1xauomBk7gt",
    category: "AO",
    color: "Terracotta",
    size: "S",
    description:
      "An unstructured, rich terracotta-colored linen shirt. Features natural raw texture, relaxed collar, and elegant drape.",
  },
  {
    id: "chunky-wool-knit",
    name: "Chunky Wool Knit",
    price: 3200000,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDDRYFHFXysaR5FJOzW-aWS0MVH9Q-MP935ID62flHLEnjqkOVAPkY4ew8gwKnKx26Rkf1V9AKdIqeUlTjM6gusKyvO4ddmZd8asBMOj71Bua4L6ZDiW0g6m-_wBMx48hL0JeUzXB4qNtdlDa4I1kCYeKQpcegyQ78tG7VzaeuBolJ4YAMAvQSWKrWQK-KPsX3uVK5yywmrkKv1e89oGtSKaYyON55ezjkQmai-i_w-6wFumVzJOx92kFlx7bALi6ZvXNJzr04coVM3",
    category: "AO",
    color: "Olive",
    size: "L",
    description:
      "Folded, thick-knit wool sweater in a deep, natural olive green. Hand-stitched details and exceptionally warm fabric.",
  },
  {
    id: "oversized-linen-shirt",
    name: "Oversized Linen Shirt",
    price: 1850000,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDvD6_O2WzakyO8IPnMGU6P_cM8Vw9NjrYur9jiYbhdx1w2UpuW5w6crh8Z6WS0E8ONEyQr1-Cg5PaIAUEe5ojxO_wL44wdNSDQUKoC8Mc8PtHpYSenjRZHw2WBtjfPI27qwMt6mcoqCQthoz_31wpBeh2Cz1icAqPBuzSVz0-Ao0TTckpd7BSXLeP5zDBAcH7oT-ZaJRLW9ZxPwcQN1vuBFaimbR982BG_YcS_liGaXAtoyAPaIEDpsbxM2wE2OAIMQEuPr6lj94GJ",
    category: "AO",
    badge: "New",
    color: "Natural",
    size: "S",
    description:
      "Off-white linen button-down shirt. The aesthetic is warm minimalism, highlighting the organic weave of flax fabric.",
  },
  {
    id: "relaxed-trousers",
    name: "Relaxed Trousers",
    price: 2100000,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA1Ar8NwYBKgDLN-CUoceiU60_VaDlBu6uba0WJ4o3sZKL3PmtT0jy3BUJWVVrYe6c_hBzpPgt63jVyOhogA9ANIM5S0IgmktTyvBII5LosZ4JcZ9hSz6w9nMp8elA7AxTrE0qGrSR23Y-NaKfksmIAs39WkmopD4WEMj0lEtngMOv3I4RIot4w-ybtOaQZCH_yrPtlAxTvsFwlcFCKfcxTna_L5OcqMJYpExQBwuejMdwGaCyJl1VYDndtCQY_lg21tp2ZNAROvwgg",
    category: "QUAN",
    color: "Sand",
    size: "M",
    description:
      "Relaxed-fit linen trousers in sand color. Long elegant drape designed for sophisticated campaigns.",
  },
  {
    id: "lightweight-jacket",
    name: "Lightweight Jacket",
    price: 1800000,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAXhzUmIMa1Z-6qdYa4laL1bVCQkOVLP6JYCCHsIwkpuhkrmG-HjEOWxgbIZj7EFBmnpyT7QitLb1EzFH7yye_4JBjFjfk_E-igXsC75ceMaA1p6QjcIEPN3sBXe0NWDZaeps8GVkryB7SYmqbpcYLMHKMHvUU1wwL25rICYwM92YUtBv1wGBRFvG77ccK-3XbtNJYcXeVr78PcMdxphd7bIc4UioU-IjL-IUkkU2vVejUSGxtmiXMGNUm7onPjVgv5SETcIb-OZnLh",
    category: "AO",
    badge: "Sale",
    color: "Olive",
    size: "M",
    description:
      "Dark olive green linen jacket. Tactile, premium construction with single breasted buttons.",
  },
  {
    id: "classic-linen-shirt",
    name: "Classic Linen Shirt",
    price: 550000,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCyQTGTpgHC2eDqWMGK8dR2RuHmPVKLBqYH20_WPIANN1bFcjjQ6-8kTI1SelzlScRo5881xkzSzOBJRYoe4ZCEbMWsPzeqydM2SbOliSQPh-TPL_WAoL7rp27x_yaBc-ZZBSe4qIc8o50jRXY4h5IFZJ21Ep5UAt5H3zV7d7ZI6AN8NcMV5aJx-vFgKR5CPdNAdoRcnsqs45aaesgReQqVl56pF2YS22-Wh2E_Zas8zX_4oPiVWTDcAc2IF3klxwGDZ2T1uIGDaNRi",
    category: "AO",
    badge: "MỚI",
    color: "Sage",
    size: "M",
    description:
      "Chất liệu linen dệt mộc cực thoáng, đường may giấu chỉ vô cùng tinh tế và chỉ chu. Áo giặt vài lần vẫn giữ phom rủ rất đẹp. Màu sắc ấm áp, dễ chịu.",
  },
  {
    id: "pleated-wool-trousers",
    name: "Pleated Wool Trousers",
    price: 1000000,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCvP7H8zQsUizbqeLCsGS0Hu3mLducId6DXvb0dwq-5VgHnm48wp8zWIsynRu5pIR4AE4ZUhPlPSHf9alsJK-GVFz9dFe37X68bqSV9t-gpzqZyUpJAdJHK4AHznxt5LgUBtExaHWPDISobXgESuMFsgJMBzFURdBOCeueSSZ7Q7B1_aD2VjnljK_qtpicDlBuOzhZDko34wB7-_XXWfDzX5u_afVC_XmAI3fffbOtgtuAo9ocnrGaHo3-afBhVIzN3nKWUEXl3bzA6",
    category: "QUAN",
    badge: "MỚI",
    color: "Charcoal",
    size: "S",
    description:
      "Quần tây ly xếp phom đứng tuyệt đẹp. Từng nếp gấp ly được ép tỉ mỉ và đứng dáng cực kỳ tôn dáng. Chất vải pha len nhẹ mặc rất dễ chịu, thích hợp cho cả công sở lẫn dạo phố cuối tuần.",
  },
  {
    id: "the-heritage-tote",
    name: "The Heritage Tote",
    price: 1600000,
    originalPrice: 1900000,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCoYMTx73sE-zl-rrk3jPvaVd_aviVz5zLceFEuv_qsiBZ0vz3tWf27Y4bM3tKDRPWUDzVbW27UEQ7321iBNy9hj5FeoekgDPBRzmdvPUwTtUiPit_j3bnUld7t5DEEzvyPcUvLdCdnrk8SfaQH51KzYB2tNWGezSFzJVMhl_Um_ej-Htfj5ixSBPA7SfU5FD_jserlObo9OvUA7agoC_03nsUmacD6b7_nhyNV0PkA5Gzn9NBahxqHhxAgBy14QadlvpSwGsafxfga",
    category: "PHU KIEN",
    badge: "Sale",
    color: "Terracotta",
    size: "OS",
    description:
      "Chiếc túi tote da thật cực kỳ dày dặn, da mềm mại tự nhiên và mùi hương mộc mạc tinh tế. Kích thước vừa vặn cho máy tính và tài liệu, quai xách chắc chắn vô cùng thanh thoát.",
  },
  {
    id: "merino-wool-coat",
    name: "Merino Wool Coat",
    price: 2400000,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC3rdhdd2Is5yjK5nAVVfW6P2sBr2eFbIuyGPXLzEMmaaz6S048ueY6FpMEhTXDQ70RHHoicQkL8NH1GrGzWkFHgtJ9AZY0aQHNRuQigIU9TZZSReu_xPV2W9m1jyi0ZDIFVUqm10oAVd9EW7Alu_gKcYdm8ZYDEkWqM2BRPBkIOA-Nb0PQlIzJj-OeG8i8Jlv6_nDIuYrw1eSjwgjtRvkjlxlOxMtc3rdT9__yYdd3YpOJXLlEPuMNJbUU88td1TYmIABgQLcnDhg4",
    category: "AO",
    color: "Charcoal",
    size: "M",
    description:
      "Chiếc áo khoác mang lại cảm giác cực kỳ ấm áp và sang trọng. Chất len merino mềm mướt không tì vết, phom dáng rủ tự nhiên chuẩn phong cách rủ tinh tế. Đây thực sự là khoản đầu tư xứng đáng cho tủ đồ mùa đông.",
  },
];

export const INITIAL_CART_ITEMS: CartItem[] = [
  {
    id: "silk-coat",
    name: "Silk Blend Tailored Coat",
    price: 4850000,
    color: "Oat",
    size: "M",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCYdVw6NSfqrb0akyMIBJweqH_ikdgR3YQiUUYJBsCQUj4ANphiX7BEBFbDXYP67O90q-SSuvlqJ0n0VemewPgKIKOoIvUY72IluuKzLbHsb7Fl4AtAL9kdQy6UDEMekEOO-Dq8TH4jEz7OGxihmIaerES3AN2U6XRn8H_pWmWDgelrO3w--9Tv5tMYDVUD6ElfZxtsIdMKrvTzREWpNAhSUUWuBVLJmBEvV-CDNLQ3LzCXQ74USh_v1gwOe3fbYjbI9EcusAYh-8Cd",
    quantity: 1,
    variantId: 1001,
  },
  {
    id: "pleated-trousers-cart",
    name: "Pleated Wide-Leg Trousers",
    price: 2200000,
    color: "Charcoal",
    size: "32",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAqazprdw5XwjumWSyZXk7fBVqgYV-Md2en-0MY01hZ2U79uUYjKS_CZhuu12l9G7CyDITpV9JKIlrCIguTuCU-PiVgyRWK5TX5ekAVgofRlgnIS9Qa7Rtkk9sMNr9_IhnZe2E5kBc1w-rAqsQXzjPSy76ovNPcxC0gS2OuxT0DLAcY48eaYiaRtiC5lx1ekFb32T9BOXAhkePYeprhOmLaA-BasgdugFfxNcRY6SWtMNZEy-xIh7igIGNrt0Ka5jjTpb9Uk6CeWEtl",
    quantity: 1,
    variantId: 1002,
  },
];

export const CHECKOUT_DEFAULT_ITEMS = [
  {
    id: "linen-overcoat",
    name: "The Linen Overcoat",
    price: 2850000,
    color: "Desert Beige",
    size: "L",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDzEpbUN-shaEnhKgeaimhkIAE6cjKG7iXJTHIQapFSiaKBexvvIM11dgtI9eXyXCsnw_quIiCDjPp0T41DuGK2cZIP3wSTOO5NFi46mgfnCOUGkbiGqrnOn2Ij0L4dQxz7gg6sU0LLvDZFRUGLo4mt6amvE5mxaNWzsanoJFw7Y7o68lv4JA5Phlk7-V2RIv8LfHpXKN6hX2ooko8cq7ElUFUYKjY-Chgfnr_O5QpSPJ-wSE0LbgBHRKOtUQjD08l1ZJReQBxW7xWf",
  },
  {
    id: "organic-poplin-shirt2",
    name: "Organic Poplin Shirt",
    price: 1450000,
    color: "Optical White",
    size: "M",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCMqphu9VlvWLNugHFT1iTILFBP6K-WM8Cb3e5pFFB8QsiCJxpEsmiFFZFM3_WpJFs1hqUHXizp3Vv7aVzzAWSGlsS8BMZW29JVxwngVK2x9YdAYK_0tRfAc4Uok-sNR0KhkzLWz6sFj2DTB89Pv6SqchyKZRotZHY8AXZoAJQYunICcwCvG1pju54IBP_DT6En5c9Ed1hXr_6rYqi2OzXe2XchKWdiLiZ-_kARufnSJw_DT-ddQf3HnEPoY0puM-r3IJSltpA72FV7",
  },
];

export const DETAIL_IMAGES = [
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDoA9Uo5k6BL6IdbvTFMUiJ7KIG8iRgQsc3QMmoqn-cKK9OqER3RQyvwyXaykaGSpkOH4ZdG_CNz4psJHcZ6zD4bPKbvH_On26upOPjqiQttw7TWlbT2z97VzL8Mah4tJPmmMnkHT1sgT0r5cwS7rrmPDXoGzYhcgO47hXj8vEWGweCKnkHIBbnVYB9oeDhwiXbCPzUG-5m78TGYs6AS7vrU57PNlDFz-jhigoBIE_QgWPc9qZ7jaT98VTYMz_yHcI0j2oTdnGRMdae",
    label: "Main Hangar",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDyD9m_xNqXFbT6dBkv-7PJErt_qbq8vpPQoDeWXzvGzka4p2u--toM85OmO0_uUkXnT-IpiV67PCYtSv0j-fiozJ88OuI38NEUWbJMBLhzRp6PkxLZsCjLUUF6sFsQAZI3WuTw7l9OfP-yaLSm9ekTok4xrmDA2Br5eMHXejZ9MaHWS2RMFgEEccxnqZqdcqBSwjvySlNud-mSbirh270Z17_6QYt2RzKWsE_1o7dejKIgmiRYnlIfAdo-ouFxXQFKwtqRuKoLBzcU",
    label: "Drape Close Up",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOKv0ijqxTbiYyYhAzBM411mGiAYjggpoXShLmWMZI_Vwj8oOyszpU355u3rrQ0U70bKeM5XajUyrym_ZMF8J-xzu8UpeGd8Kjw6VtZdBZkQMfkeJPN6SohMd-mlT7tVNWLySj6dJAVidu_wWtBkM1xyWhGSvqQuoG1xx4vfGMbdzq5CEMj7HIQpxZuECgT0ynfdhoOwnjVgdnY40gclr2NNfwA55x6CRZYAxMlZSG1dDIkLeNR-7V7WI7rBi1Pau-CxxoCRd_vb0Z",
    label: "Horn Seam Detail",
  },
];

// Map backend product data to client-side Product model to preserve high-res images and styling.
export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  if (url.startsWith("/uploads/") || url.startsWith("uploads/")) {
    const cleanPath = url.startsWith("/") ? url : `/${url}`;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    try {
      const parsed = new URL(apiUrl);
      return `${parsed.origin}${cleanPath}`;
    } catch {
      return `http://localhost:8080${cleanPath}`;
    }
  }
  return url;
}

export function mapBackendProduct(
  bp: {
    id: number;
    slug: string;
    originalSlug?: string;
    name: string;
    description: string;
    categoryId: number;
    price?: number | null;
    salePrice?: number | null;
    image?: string | null;
    thumbnail?: string | null;
    status?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    material?: string;
    care?: string;
    shortDescription?: string;
    images?: string[];
    categoryName?: string | null;
    categorySlug?: string | null;
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  locale: string = "vi"
): Product {
  // Find local match by matching originalSlug, slug, or name
  const match = PRODUCTS.find(
    (p) =>
      (bp.originalSlug && p.id === bp.originalSlug) ||
      p.id === bp.slug ||
      p.id === bp.slug.replace(/-[0-9]+$/, "") ||
      p.name.toLowerCase() === bp.name.toLowerCase()
  );

  const mainImg = bp.image || bp.thumbnail || (match ? match.image : undefined);
  const resolvedMainImg = resolveImageUrl(mainImg);

  const rawImages = bp.images && bp.images.length > 0 
    ? bp.images 
    : (match && match.id === "linen-blazer" 
        ? DETAIL_IMAGES.map((img) => img.src) 
        : [mainImg || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80"]);

  return {
    id: bp.slug,
    realId: bp.id,
    name: bp.name,
    description: bp.description || (match ? match.description : ""),
    price: bp.salePrice ?? bp.price ?? 0,
    originalPrice: bp.salePrice != null ? bp.price ?? undefined : undefined,
    image: resolvedMainImg,
    badge: match ? match.badge : undefined,
    color: match ? match.color : "Black",
    size: match ? match.size : "M",
    category: bp.categoryName || (match ? match.category : (bp.categoryId === 2 ? "AO" : bp.categoryId === 3 ? "QUAN" : "PHU KIEN")),
    seoTitle: bp.seoTitle,
    seoDescription: bp.seoDescription,
    seoKeywords: bp.seoKeywords,
    material: bp.material,
    care: bp.care,
    shortDescription: bp.shortDescription,
    images: rawImages.map(resolveImageUrl),
  };
}
