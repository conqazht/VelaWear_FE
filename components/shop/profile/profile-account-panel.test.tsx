import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "@/lib/api/types";
import { ProfileAccountPanel } from "./profile-account-panel";

const { mutateAsyncMock, checkSessionMock } = vi.hoisted(() => ({
  mutateAsyncMock: vi.fn(),
  checkSessionMock: vi.fn(),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => ({
    user: { id: 1, email: "test@example.com", fullName: "Cong Anh" },
    isAuthenticated: true,
  }),
}));

vi.mock("@/components/providers/i18n-provider", () => ({
  useI18n: () => ({
    locale: "vi",
    t: (key: string, params?: Record<string, unknown>) => {
      if (key === "account.visibility.memberSince") return `Member since ${params?.date}`;
      return key;
    },
  }),
}));

vi.mock("@/lib/queries/commerce", () => ({
  useUpdateProfileMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useUploadAvatarMutation: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: false,
  }),
  useDeleteMyAddressMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateMyAddressMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCreateMyAddressMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("ProfileAccountPanel - Avatar Upload & Visibility", () => {
  const dummyUser: User = {
    id: 1,
    email: "test@example.com",
    fullName: "Cong Anh",
    birthDate: "2000-01-01",
    gender: "MALE",
    avatar: null,
    hasPassword: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };

  const dummyAddressesQuery = {
    data: { result: [] },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mutateAsyncMock.mockResolvedValue({ ...dummyUser, avatar: "/uploads/avatars/user-1.png" });
    checkSessionMock.mockResolvedValue(undefined);
  });

  it("renders initials fallback when user does not have avatar", () => {
    render(
      <ProfileAccountPanel
        user={dummyUser}
        checkSession={checkSessionMock}
        addressesQuery={dummyAddressesQuery}
        activeSidebarTab="visibility"
        setActiveSidebarTab={vi.fn()}
      />,
    );

    expect(screen.getByText("CA")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "account.visibility.editAvatar" }),
    ).toBeInTheDocument();
  });

  it("renders user avatar image when user.avatar is provided", () => {
    render(
      <ProfileAccountPanel
        user={{ ...dummyUser, avatar: "/uploads/avatars/user-1.png" }}
        checkSession={checkSessionMock}
        addressesQuery={dummyAddressesQuery}
        activeSidebarTab="visibility"
        setActiveSidebarTab={vi.fn()}
      />,
    );

    const img = screen.getByRole("img", { name: "Cong Anh" });
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toContain("/uploads/avatars/user-1.png");
  });

  it("validates file type and shows error for invalid extension", async () => {
    render(
      <ProfileAccountPanel
        user={dummyUser}
        checkSession={checkSessionMock}
        addressesQuery={dummyAddressesQuery}
        activeSidebarTab="visibility"
        setActiveSidebarTab={vi.fn()}
      />,
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    const invalidFile = new File(["dummy text"], "doc.pdf", { type: "application/pdf" });
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText("account.visibility.avatarTypeError")).toBeInTheDocument();
    });
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it("validates file size and shows error for files over 5MB", async () => {
    render(
      <ProfileAccountPanel
        user={dummyUser}
        checkSession={checkSessionMock}
        addressesQuery={dummyAddressesQuery}
        activeSidebarTab="visibility"
        setActiveSidebarTab={vi.fn()}
      />,
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const largeFile = new File(["a"], "large.png", { type: "image/png" });
    Object.defineProperty(largeFile, "size", { value: 6 * 1024 * 1024 });

    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(screen.getByText("account.visibility.avatarSizeError")).toBeInTheDocument();
    });
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it("successfully uploads valid image file and refreshes session", async () => {
    render(
      <ProfileAccountPanel
        user={dummyUser}
        checkSession={checkSessionMock}
        addressesQuery={dummyAddressesQuery}
        activeSidebarTab="visibility"
        setActiveSidebarTab={vi.fn()}
      />,
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = new File(["valid image data"], "avatar.png", { type: "image/png" });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith(validFile);
      expect(checkSessionMock).toHaveBeenCalledTimes(1);
      expect(screen.getByText("account.visibility.avatarUploadSuccess")).toBeInTheDocument();
    });
  });

  it("handles upload error and displays error message", async () => {
    mutateAsyncMock.mockRejectedValueOnce(new Error("Network Error"));

    render(
      <ProfileAccountPanel
        user={dummyUser}
        checkSession={checkSessionMock}
        addressesQuery={dummyAddressesQuery}
        activeSidebarTab="visibility"
        setActiveSidebarTab={vi.fn()}
      />,
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = new File(["valid image data"], "avatar.webp", { type: "image/webp" });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith(validFile);
      expect(screen.getByText("Network Error")).toBeInTheDocument();
    });
  });

  it("renders date of birth formatted strictly as dd/mm/yyyy in the account tab", () => {
    render(
      <ProfileAccountPanel
        user={{ ...dummyUser, birthDate: "1998-07-24" }}
        checkSession={checkSessionMock}
        addressesQuery={dummyAddressesQuery}
        activeSidebarTab="account"
        setActiveSidebarTab={vi.fn()}
      />,
    );

    const dobInput = screen.getByLabelText("account.profile.birthDate") as HTMLInputElement;
    expect(dobInput).toBeInTheDocument();
    expect(dobInput.value).toBe("24/07/1998");
  });

  it("renders edit email button and standard note for direct password accounts", () => {
    render(
      <ProfileAccountPanel
        user={{ ...dummyUser, hasPassword: true }}
        checkSession={checkSessionMock}
        addressesQuery={dummyAddressesQuery}
        activeSidebarTab="account"
        setActiveSidebarTab={vi.fn()}
      />,
    );

    expect(screen.getByText("account.profile.emailSettingsNote")).toBeInTheDocument();
    expect(screen.queryByText("account.profile.googleEmailNote")).not.toBeInTheDocument();
    const editButtons = screen.getAllByRole("button", { name: "account.profile.edit" });
    // Both email and password have Edit buttons
    expect(editButtons.length).toBeGreaterThanOrEqual(2);
  });

  it("hides edit email button and displays Google email note for OAuth accounts", () => {
    render(
      <ProfileAccountPanel
        user={{ ...dummyUser, hasPassword: false }}
        checkSession={checkSessionMock}
        addressesQuery={dummyAddressesQuery}
        activeSidebarTab="account"
        setActiveSidebarTab={vi.fn()}
      />,
    );

    expect(screen.getByText("account.profile.googleEmailNote")).toBeInTheDocument();
    expect(screen.queryByText("account.profile.emailSettingsNote")).not.toBeInTheDocument();
    const editButtons = screen.getAllByRole("button", { name: "account.profile.edit" });
    // Only password has Edit button (to set a password), email edit button is hidden
    expect(editButtons.length).toBe(1);
  });
});
