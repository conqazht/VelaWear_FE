import { ImageResponse } from "next/og";
import { SocialPreviewFrame } from "@/components/seo/social-preview-frame";

export const alt = "VELA WEAR - Thời Trang Thiết Kế Cao Cấp";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        backgroundColor: "#161514",
        color: "#f7f4ef",
        fontFamily: "serif",
        position: "relative",
      }}
    >
      <SocialPreviewFrame />
    </div>,
    {
      ...size,
    },
  );
}
