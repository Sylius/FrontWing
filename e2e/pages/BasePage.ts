import { Page } from "@playwright/test";

export class BasePage {
  constructor(readonly page: Page) {}

  async goto(path: string) {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    // Wait for page to be in stable state
    await this.page.waitForLoadState("networkidle");
  }

  async waitForSelector(selector: string, timeout = 5000) {
    await this.page.locator(selector).waitFor({ timeout });
  }

  async isVisible(selector: string) {
    return this.page.locator(selector).isVisible();
  }

  async getText(selector: string) {
    return this.page.locator(selector).textContent();
  }
}
