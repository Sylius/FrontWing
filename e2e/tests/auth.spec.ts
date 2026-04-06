import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

test.describe("Authentication", () => {
  test("successful login redirects to dashboard", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    const email = process.env.PLAYWRIGHT_TEST_EMAIL || "test@example.com";
    const password = process.env.PLAYWRIGHT_TEST_PASSWORD || "Password123!";

    await loginPage.fillEmail(email);
    await loginPage.fillPassword(password);
    await loginPage.submit();

    // Wait for navigation to dashboard
    await page.waitForURL(/\/account\/dashboard/, { timeout: 10000 });
    expect(page.url()).toContain("/account/dashboard");
  });

  test("invalid login shows field-level error", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.fillEmail("wrong@example.com");
    await loginPage.fillPassword("WrongPassword123!");
    await loginPage.submit();

    // The token fetch may fail immediately (DNS abort) or return 401 — in both cases
    // networkidle fires before React re-renders the error. Wait for the element directly.
    await page.locator("#email-error").waitFor({ state: "visible", timeout: 10000 });

    // Should show field-level error, not redirect
    const emailError = await loginPage.getEmailError();
    expect(emailError).toBeTruthy();
    expect(page.url()).toContain("/login");
  });

  test("re-submission works after server error", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // First submission with wrong credentials
    await loginPage.fillEmail("wrong@example.com");
    await loginPage.fillPassword("WrongPassword123!");
    await loginPage.submit();

    // Token fetch may abort immediately — wait for the error element directly.
    await page.locator("#email-error").waitFor({ state: "visible", timeout: 10000 });
    const emailError = await loginPage.getEmailError();
    expect(emailError).toBeTruthy();

    // Now fill correct credentials and re-submit
    const email = process.env.PLAYWRIGHT_TEST_EMAIL || "test@example.com";
    const password = process.env.PLAYWRIGHT_TEST_PASSWORD || "Password123!";

    await loginPage.fillEmail(email);
    await loginPage.fillPassword(password);
    await loginPage.submit();

    // Should successfully redirect to dashboard (regression test for clearServerErrors)
    // Re-submission takes longer: token fetch (~5s) + refetchCustomer (~5s) in Docker.
    await page.waitForURL(/\/account\/dashboard/, { timeout: 20000 });
    expect(page.url()).toContain("/account/dashboard");
  });

  test("unauthenticated access redirects to login", async ({ page, context }) => {
    // No storageState applied in this test — fresh context has no jwtToken
    await context.clearCookies();

    await page.goto("/account/dashboard");

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 10000 });
    expect(page.url()).toContain("/login");
  });
});
