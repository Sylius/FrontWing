import { BasePage } from "./BasePage";

export class ProfilePage extends BasePage {
  async goto() {
    await super.goto("/account/profile/edit");
  }

  async fillFirstName(value: string) {
    await this.page.locator('input[aria-describedby="firstName-error"]').fill(value);
  }

  async fillLastName(value: string) {
    await this.page.locator('input[aria-describedby="lastName-error"]').fill(value);
  }

  async fillEmail(value: string) {
    await this.page.locator('input[type="email"]').fill(value);
  }

  async fillBirthday(dateString: string) {
    await this.page.locator('input[type="date"]').fill(dateString);
  }

  async clearBirthday() {
    await this.page.locator('input[type="date"]').clear();
  }

  async fillPhoneNumber(value: string) {
    const inputs = this.page.locator('input[type="text"]');
    // Phone number is typically one of the later text inputs
    await inputs.last().fill(value);
  }

  async submit() {
    await this.page.locator('button[type="submit"]').click();
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

  async getSuccessMessage() {
    // Wait for flash message from FlashMessagesContext
    const successMessage = this.page.locator(
      '[role="alert"]:has-text("Profile updated successfully"), [class*="toast"]:has-text("Profile updated")'
    );
    if (await successMessage.isVisible({ timeout: 5000 })) {
      return await successMessage.textContent();
    }
    return null;
  }

  async waitForSuccessMessage(timeout = 5000) {
    await this.page.locator('[role="alert"]').first().waitFor({ timeout });
  }
}
