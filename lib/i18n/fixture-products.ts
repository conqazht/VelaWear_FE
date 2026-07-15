import type { Locale } from "@/lib/i18n";
import type { Product } from "@/lib/vela-data";

type ProductCopy = Partial<Pick<Product, "name" | "description" | "badge" | "color">>;

const ENGLISH_OVERRIDES: Record<string, ProductCopy> = {
  "classic-linen-shirt": {
    badge: "New",
    description:
      "Exceptionally breathable rustic-woven linen with meticulous hidden stitching. It keeps its elegant drape after repeated washes and comes in a warm, easy-to-style shade.",
  },
  "pleated-wool-trousers": {
    badge: "New",
    description:
      "Beautifully structured pleated trousers. Every fold is carefully pressed to hold its shape and flatter the silhouette. The lightweight wool blend is comfortable for work and relaxed weekends alike.",
  },
  "the-heritage-tote": {
    description:
      "A substantial genuine-leather tote with a naturally soft hand and refined, earthy character. It is sized for a laptop and documents, with sturdy yet elegant handles.",
  },
  "merino-wool-coat": {
    description:
      "An exceptionally warm and luxurious coat. Impeccably soft merino wool and a natural drape create a refined silhouette—an enduring winter wardrobe investment.",
  },
};

const VIETNAMESE_OVERRIDES: Record<string, ProductCopy> = {
  "linen-blazer": {
    name: "Áo blazer pha linen",
    badge: "Gợi ý theo mùa",
    color: "Màu cát",
    description:
      "Được may đo tỉ mỉ từ hỗn hợp sợi lanh châu Âu và cotton hữu cơ thủ công. Thiết kế có đường may kim đôi, đệm vai đứng dáng nhưng mềm mại cùng cúc sừng thô, tạo nên vẻ tối giản tinh tế.",
  },
  "silk-blouse": {
    name: "Áo blouse lụa dáng rủ",
    badge: "Được yêu thích nhất",
    color: "Màu kem",
    description:
      "Áo blouse lụa crepe de chine mềm rủ với nếp xếp nhẹ ở vai và chi tiết buộc sau lưng. Một thiết kế sang trọng nhưng thoải mái, phù hợp cho vẻ thanh lịch tự nhiên.",
  },
  "wide-trousers": {
    name: "Quần ống rộng",
    badge: "Giảm giá",
    color: "Màu đất nung",
    description:
      "Được may từ vải canvas pha len Ý với cạp cao, hai ly gọn gàng và ống dài thanh lịch. Phom quần tôn dáng với độ rủ mềm mại, uyển chuyển.",
  },
  "leather-tote": {
    name: "Túi tote da phom cứng",
    badge: "Mới",
    color: "Nâu da",
    description:
      "Túi tote dùng hằng ngày với đường nét gọn gàng, chắc chắn, làm từ da thuộc thảo mộc cao cấp. Dễ dàng đựng máy tính bảng, sổ tay và các vật dụng thiết yếu.",
  },
  "signature-hemp-tee": {
    name: "Áo thun hemp đặc trưng",
    color: "Xám",
    description:
      "Áo thun xám phom rộng tối giản, may từ hỗn hợp sợi hemp và cotton hữu cơ cao cấp. Chất liệu thoáng khí vượt trội nhưng vẫn giữ được độ đứng cần thiết.",
  },
  "artisan-linen-overshirt": {
    name: "Áo sơ mi khoác linen thủ công",
    color: "Màu đất nung",
    description:
      "Áo sơ mi linen không cấu trúc trong gam đất nung đậm. Bề mặt vải thô tự nhiên, cổ áo thoải mái và phom rủ thanh lịch.",
  },
  "chunky-wool-knit": {
    name: "Áo len dệt dày",
    color: "Xanh ô liu",
    description:
      "Áo len dệt dày trong gam xanh ô liu tự nhiên và trầm. Chi tiết khâu tay cùng chất len đặc biệt ấm áp tạo nên cảm giác thủ công rõ nét.",
  },
  "oversized-linen-shirt": {
    name: "Áo sơ mi linen oversized",
    badge: "Mới",
    color: "Màu tự nhiên",
    description:
      "Áo sơ mi cài nút bằng linen trắng ngà. Tinh thần tối giản ấm áp làm nổi bật bề mặt dệt hữu cơ của sợi lanh.",
  },
  "relaxed-trousers": {
    name: "Quần linen dáng suông",
    color: "Màu cát",
    description:
      "Quần linen phom thoải mái trong gam màu cát. Ống quần dài với độ rủ thanh lịch, phù hợp cho phong cách tinh tế và tự nhiên.",
  },
  "lightweight-jacket": {
    name: "Áo khoác nhẹ",
    badge: "Giảm giá",
    color: "Xanh ô liu",
    description:
      "Áo khoác linen màu xanh ô liu đậm. Kết cấu cao cấp giàu cảm giác bề mặt, hoàn thiện với hàng cúc đơn thanh lịch.",
  },
  "classic-linen-shirt": {
    name: "Áo sơ mi linen cổ điển",
    badge: "Mới",
    color: "Xanh xô thơm",
    description:
      "Chất liệu linen dệt mộc cực thoáng với đường may giấu chỉ tỉ mỉ. Áo vẫn giữ được phom rủ đẹp sau nhiều lần giặt, trong gam màu ấm áp và dễ phối.",
  },
  "pleated-wool-trousers": {
    name: "Quần len xếp ly",
    badge: "Mới",
    color: "Than chì",
    description:
      "Quần tây xếp ly với phom đứng đẹp mắt. Từng nếp gấp được ép tỉ mỉ để giữ dáng và tôn đường nét. Vải pha len nhẹ tạo cảm giác dễ chịu cho cả công sở lẫn cuối tuần.",
  },
  "the-heritage-tote": {
    name: "Túi tote di sản",
    badge: "Giảm giá",
    color: "Màu đất nung",
    description:
      "Túi tote da thật dày dặn với bề mặt mềm tự nhiên và sắc thái mộc mạc tinh tế. Kích thước vừa vặn cho máy tính cùng tài liệu, đi kèm quai xách chắc chắn nhưng thanh thoát.",
  },
  "merino-wool-coat": {
    name: "Áo khoác len merino",
    color: "Than chì",
    description:
      "Áo khoác đặc biệt ấm áp và sang trọng. Len merino mềm mượt cùng độ rủ tự nhiên tạo nên phom dáng tinh tế—một khoản đầu tư bền vững cho tủ đồ mùa đông.",
  },
};

export function localizeFixtureProduct(product: Product, locale: Locale): Product {
  const overrides = locale === "vi" ? VIETNAMESE_OVERRIDES : ENGLISH_OVERRIDES;
  return { ...product, ...overrides[product.id] };
}
