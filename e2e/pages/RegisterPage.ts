import { BasePage } from "./BasePage";

export class RegisterPage extends BasePage {
  async goto() {
    await super.goto("/register");
  }

  async fillFirstName(value: string) {
    await this.page.locator("#firstName").fill(value);
  }

  async fillLastName(value: string) {
    await this.page.locator("#lastName").fill(value);
  }

  async fillEmail(value: string) {
    await this.page.locator("#email").fill(value);
  }

  async fillPassword(value: string) {
    await this.page.locator("#password").fill(value);
  }

  async fillConfirmPassword(value: string) {
    await this.page.locator("#confirmPassword").fill(value);
  }

  async submit() {
    await this.page.locator('button[type="submit"]').first().click();
  }

  async getFieldError(fieldName: string) {
    const errorSpan = this.page.locator(`#${fieldName}-error`);
    if (await errorSpan.isVisible()) {
      return await errorSpan.textContent();
    }
    return null;
  }

  async isFieldErrorVisible(fieldName: string) {
    return this.page.locator(`#${fieldName}-error`).isVisible();
  }

  async getPasswordStrengthText() {
    const strengthElement = this.page.locator('[data-testid="password-strength-label"]');
    if (await strengthElement.isVisible()) {
      return await strengthElement.textContent();
    }
    return null;
  }

  async waitForPasswordStrengthIndicator() {
    await this.page.locator('[class*="password-strength"]').waitFor({ timeout: 5000 });
  }
}
