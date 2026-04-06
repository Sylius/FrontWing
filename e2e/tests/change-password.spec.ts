import { test, expect } from "@playwright/test";
import { ChangePasswordPage } from "../pages/ChangePasswordPage";
import * as fs from "fs";

const authFile = new URL("../.auth/user.json", import.meta.url).pathname;

// Only run these tests if we have a valid auth file
test.describe("Change Password (Authenticated)", () => {
  test.use({
    storageState: fs.existsSync(authFile) ? authFile : undefined,
  });

  test("wrong current password shows server error", async ({ page }) => {
    const changePasswordPage = new ChangePasswordPage(page);
    await changePasswordPage.goto();

    // Fill with wrong current password
    await changePasswordPage.fillCurrentPassword("WrongPassword123!");
    await changePasswordPage.fillNewPassword("NewPassword123!");
    await changePasswordPage.fillConfirmation("NewPassword123!");

    // Submit form
    await changePasswordPage.submit();

    // Server response completes, but React re-renders asynchronously after networkidle.
    // Wait for the error element directly to avoid the race condition.
    await page.locator("#currentPassword-error").waitFor({ state: "visible", timeout: 15000 });

    // Current password error should be visible
    const currentPasswordError = await changePasswordPage.getFieldError("currentPassword");
    expect(currentPasswordError).toBeTruthy();
  });

  test("mismatched confirmation shows inline error", async ({ page }) => {
    const changePasswordPage = new ChangePasswordPage(page);
    await changePasswordPage.goto();

    const currentPassword = process.env.PLAYWRIGHT_TEST_PASSWORD || "Password123!";

    // Fill with mismatched confirmation
    await changePasswordPage.fillCurrentPassword(currentPassword);
    await changePasswordPage.fillNewPassword("NewPass1!@");
    await changePasswordPage.fillConfirmation("DifferentPass1!@");

    // Submit form
    await changePasswordPage.submit();

    // Wait for validation
    await page.waitForTimeout(500);

    // Confirmation error should be visible
    const confirmationError = await changePasswordPage.getFieldError("confirmation");
    expect(confirmationError).toContain("do not match");
  });

  test("successful change redirects to dashboard with success message", async ({ page }) => {
    const changePasswordPage = new ChangePasswordPage(page);
    const currentPassword = process.env.PLAYWRIGHT_TEST_PASSWORD || "Password123!";
    const newPassword = "NewSecurePass123!@";

    // Change to new password
    await changePasswordPage.goto();
    await changePasswordPage.fillCurrentPassword(currentPassword);
    await changePasswordPage.fillNewPassword(newPassword);
    await changePasswordPage.fillConfirmation(newPassword);
    await changePasswordPage.submit();

    await page.waitForURL(/\/account\/dashboard/, { timeout: 10000 });
    expect(page.url()).toContain("/account/dashboard");

    await expect(page.locator("[data-sonner-toast]").first()).toContainText(/success/i, {
      timeout: 5000,
    });

    // Restore original password so subsequent test runs don't break
    await changePasswordPage.goto();
    await changePasswordPage.fillCurrentPassword(newPassword);
    await changePasswordPage.fillNewPassword(currentPassword);
    await changePasswordPage.fillConfirmation(currentPassword);
    await changePasswordPage.submit();
    await page.waitForURL(/\/account\/dashboard/, { timeout: 10000 });
  });
});
