import { beforeEach, describe, expect, it, vi } from "vitest";

const { postMock } = vi.hoisted(() => ({ postMock: vi.fn() }));

vi.mock("@/lib/api-client", () => ({
  default: { post: postMock },
}));

import { createReview } from "@/lib/api/commerce";

describe("createReview", () => {
  beforeEach(() => {
    postMock.mockReset();
    postMock.mockResolvedValue({
      data: {
        statusCode: 201,
        message: "Created",
        data: { id: 9 },
      },
    });
  });

  it("chỉ gửi review JSON an toàn và các file nhị phân bằng multipart", async () => {
    const image = new File(["image"], "customer.webp", { type: "image/webp" });

    await createReview({
      orderItemId: 41,
      rating: 5,
      comment: "  Chất liệu đẹp.  ",
      images: [image],
    });

    expect(postMock).toHaveBeenCalledTimes(1);
    const [path, body, config] = postMock.mock.calls[0] as [string, FormData, unknown];
    expect(path).toBe("/reviews");
    expect(config).toBeUndefined();
    expect(body).toBeInstanceOf(FormData);

    const reviewPart = body.get("review");
    expect(reviewPart).toBeInstanceOf(Blob);
    const payload = JSON.parse(await (reviewPart as Blob).text());
    expect(payload).toEqual({ orderItemId: 41, rating: 5, comment: "Chất liệu đẹp." });
    expect(payload).not.toHaveProperty("userId");
    expect(payload).not.toHaveProperty("imageUrl");
    expect(body.getAll("images")).toEqual([image]);
  });
});
