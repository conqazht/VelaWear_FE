import type { Locator, Page } from "@playwright/test";

export class AuthHeaderComponent {
  readonly loginLink: Locator;
  readonly logoutButton: Locator;
  readonly profileLink: Locator;
  readonly root: Locator;

  constructor(page: Page) {
    this.root = page.getByRole("banner");
    this.loginLink = this.root.getByRole("link", { name: /Đăng nhập|Log in/i });
    this.logoutButton = this.root.getByRole("button", { name: /Đăng xuất|Log out/i });
    this.profileLink = this.root.getByRole("link", { name: /Xem hồ sơ|View profile/i });
  }
}
