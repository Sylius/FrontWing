import { test, expect } from "@playwright/test";
import { RegisterPage } from "../pages/RegisterPage";

test.describe("Registration", () => {
  test.beforeEach(async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  test("mismatched passwords shows confirmation error", async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.fillFirstName("John");
    await registerPage.fillLastName("Doe");
    await registerPage.fillEmail("newuser@example.com");
    await registerPage.fillPassword("Password1!");
    await registerPage.fillConfirmPassword("Password2!");

    await registerPage.submit();

    // Wait for validation
    await page.waitForTimeout(500);

    // Confirmation error should be visible
    const confirmError = await registerPage.getFieldError("confirmPassword");
    expect(confirmError).toContain("do not match");
  });

  test("password strength indicator updates as user types", async ({ page }) => {
    const registerPage = new RegisterPage(page);

    // Type a password that scores 1/4 ("Too weak" label)
    await registerPage.fillPassword("abcdefgh");
    await page.waitForTimeout(300);

    // Check for weak indicator text
    let strengthText = await registerPage.getPasswordStrengthText();
    expect(strengthText?.toLowerCase()).toContain("weak");

    // Clear and type strong password
    await page.locator("#password").clear();
    await registerPage.fillPassword("Abcde1!@");
    await page.waitForTimeout(300);

    // Check for strong indicator text
    strengthText = await registerPage.getPasswordStrengthText();
    expect(strengthText?.toLowerCase()).toContain("strong");
  });
});
