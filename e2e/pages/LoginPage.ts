import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  async goto() {
    await super.goto("/login");
  }

  async fillEmail(value: string) {
    await this.page.locator("#_username").fill(value);
  }

  async fillPassword(value: string) {
    await this.page.locator("#_password").fill(value);
  }

  async submit() {
    await this.page.locator('button[type="submit"]').click();
  }

  async getEmailError() {
    const errorSpan = this.page.locator("#email-error");
    if (await errorSpan.isVisible()) {
      return await errorSpan.textContent();
    }
    return null;
  }

  async getPasswordError() {
    const errorSpan = this.page.locator("#password-error");
    if (await errorSpan.isVisible()) {
      return await errorSpan.textContent();
    }
    return null;
  }

  async isEmailErrorVisible() {
    return this.page.locator("#email-error").isVisible();
  }

  async isPasswordErrorVisible() {
    return this.page.locator("#password-error").isVisible();
  }

  async isAnyFieldInvalid() {
    const invalidFields = this.page.locator('[aria-invalid="true"]');
    return (await invalidFields.count()) > 0;
  }
}
