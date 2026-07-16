import { beforeEach, describe, expect, it, vi } from "vitest";

const clientMocks = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

vi.mock("@/lib/api/client", () => clientMocks);
vi.mock("@/lib/api-client", () => ({
  logoutAuthSession: vi.fn(),
  refreshAccessTokenOnce: vi.fn(),
  setAccessToken: vi.fn(),
  withAuthSessionLock: (operation: () => Promise<unknown>) => operation(),
}));

import { register } from "@/lib/api/auth";

describe("auth API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gửi otpProofToken khi tạo tài khoản", async () => {
    clientMocks.apiPost.mockResolvedValue({
      id: 1,
      email: "member@example.com",
      fullName: "Vela Member",
      birthDate: null,
      avatar: null,
      gender: null,
      createdAt: "2026-07-16T00:00:00Z",
      updatedAt: "2026-07-16T00:00:00Z",
      hasPassword: true,
    });

    const request = {
      email: "member@example.com",
      password: "Password1",
      fullName: "Vela Member",
      birthDate: null,
      gender: null,
      otpProofToken: "register-proof",
    } as const;
    await register(request);

    expect(clientMocks.apiPost).toHaveBeenCalledWith("/auth/register", request);
  });
});
