import { BasePage } from "./BasePage";

export class ChangePasswordPage extends BasePage {
  async goto() {
    await super.goto("/account/change-password");
    // CustomerContext's useEffect fires after the initial render, starting a customer
    // fetch that takes ~5s in Docker. networkidle fires before this fetch even begins,
    // leaving customer=null when the form submits. Wait for the Logout button instead —
    // it only appears after the customer fetch completes, guaranteeing customer is non-null.
    await this.page.locator('button:has-text("Logout")').waitFor({ timeout: 15000 });
  }

  async fillCurrentPassword(value: string) {
    await this.page.locator('input[aria-describedby="currentPassword-error"]').fill(value);
  }

  async fillNewPassword(value: string) {
    await this.page.locator('input[aria-describedby="newPassword-error"]').fill(value);
  }

  async fillConfirmation(value: string) {
    const input = this.page.locator('input[aria-describedby="confirmation-error"]');
    await input.fill(value);
    // Trigger blur so TanStack Form re-runs the onBlur validator with the filled value,
    // clearing any stale "Passwords do not match" error that was set when newPassword
    // blurred (via onBlurListenTo) before confirmation was filled.
    await input.blur();
  }

  async submit() {
    await this.page.locator('button[id="save-changes"]').click();
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
      '[role="alert"]:has-text("Password changed successfully"), [class*="toast"]:has-text("Password changed")'
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
