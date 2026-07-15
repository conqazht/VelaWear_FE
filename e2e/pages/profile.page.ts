import type { Page, Response } from "@playwright/test";

import { AuthHeaderComponent } from "./components/auth-header.component";

type ProfileBootstrapResponses = {
  meResponse: Response;
  refreshResponse: Response;
};

function isProfileBootstrapResponse(
  response: Response,
  method: "GET" | "POST",
  pathname: string,
) {
  return response.request().method() === method && new URL(response.url()).pathname === pathname;
}

export class ProfilePage {
  readonly authHeader: AuthHeaderComponent;

  constructor(private readonly page: Page) {
    this.authHeader = new AuthHeaderComponent(page);
  }

  async goto() {
    await this.page.goto("/profile", { waitUntil: "domcontentloaded" });
  }

  async gotoAndWaitForBootstrap(): Promise<ProfileBootstrapResponses> {
    const [refreshResponse, meResponse] = await Promise.all([
      this.page.waitForResponse((response) =>
        isProfileBootstrapResponse(response, "POST", "/api/v1/auth/refresh")
      ),
      this.page.waitForResponse((response) =>
        isProfileBootstrapResponse(response, "GET", "/api/v1/auth/me")
      ),
      this.goto(),
    ]);

    return { meResponse, refreshResponse };
  }
}
