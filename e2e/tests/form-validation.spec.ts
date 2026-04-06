import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

test.describe("Form Validation (SPEC-UPDATE-001)", () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("no errors on fresh page load", async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Check that no fields have aria-invalid="true"
    const invalidFields = page.locator('[aria-invalid="true"]');
    expect(await invalidFields.count()).toBe(0);

    // Check that error spans are not visible
    expect(await loginPage.isEmailErrorVisible()).toBe(false);
    expect(await loginPage.isPasswordErrorVisible()).toBe(false);
  });

  test("blur on empty email shows error", async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Focus and blur email field without entering value
    await page.locator('input[name="_username"]').focus();
    await page.locator('input[name="_username"]').blur();

    // Wait for validation
    await page.waitForTimeout(500);

    // Error should be visible
    expect(await loginPage.isEmailErrorVisible()).toBe(true);
    const errorText = await loginPage.getEmailError();
    expect(errorText).toBeTruthy();
  });

  test("submit empty form shows all errors simultaneously", async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Submit without filling any fields
    await loginPage.submit();

    // Wait for validation errors
    await page.waitForTimeout(500);

    // Both errors should be visible
    expect(await loginPage.isEmailErrorVisible()).toBe(true);
    expect(await loginPage.isPasswordErrorVisible()).toBe(true);

    // Both fields should have aria-invalid="true"
    const emailInput = page.locator('input[name="_username"]');
    const passwordInput = page.locator('input[name="_password"]');

    expect(await emailInput.getAttribute("aria-invalid")).toBe("true");
    expect(await passwordInput.getAttribute("aria-invalid")).toBe("true");
  });

  test("fixing a field after error clears the error", async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Submit empty form to trigger errors
    await loginPage.submit();
    await page.waitForTimeout(500);

    // Verify email error is visible
    expect(await loginPage.isEmailErrorVisible()).toBe(true);

    // Fill email with valid value
    await loginPage.fillEmail("test@example.com");

    // Blur to trigger validation
    await page.locator('input[name="_username"]').blur();
    await page.waitForTimeout(500);

    // Email error should be cleared
    expect(await loginPage.isEmailErrorVisible()).toBe(false);

    // Password error should still be visible
    expect(await loginPage.isPasswordErrorVisible()).toBe(true);
  });
});
