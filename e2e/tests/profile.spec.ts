import { test, expect } from "@playwright/test";
import { ProfilePage } from "../pages/ProfilePage";
import * as fs from "fs";

const authFile = new URL("../.auth/user.json", import.meta.url).pathname;

// Only run these tests if we have a valid auth file
test.describe("Profile (Authenticated)", () => {
  test.use({
    storageState: fs.existsSync(authFile) ? authFile : undefined,
  });

  test("empty birthday shows required error", async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goto();

    // Wait for page to load with data
    await page.waitForTimeout(2000);

    // Clear birthday field
    await profilePage.clearBirthday();

    // Submit form
    await profilePage.submit();

    // Wait for validation
    await page.waitForTimeout(500);

    // Birthday error should be visible
    const birthdayError = await profilePage.getFieldError("birthday");
    expect(birthdayError).toBeTruthy();
  });

  test("future birthday shows error", async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goto();

    // Wait for page to load with data
    await page.waitForTimeout(2000);

    // Set future date
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const futureDateString = futureDate.toISOString().split("T")[0];

    await profilePage.fillBirthday(futureDateString);

    // Submit form
    await profilePage.submit();

    // Wait for validation
    await page.waitForTimeout(500);

    // Birthday error should be visible
    const birthdayError = await profilePage.getFieldError("birthday");
    expect(birthdayError).toBeTruthy();
  });

  test("successful update shows flash message", async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goto();

    // Wait for page to load with data
    await page.waitForTimeout(2000);

    // Fill with valid data
    await profilePage.fillFirstName("John");
    await profilePage.fillLastName("Doe");

    // Submit form
    await profilePage.submit();

    // Wait for success message (profile API takes ~5s in Docker)
    await expect(page.locator("[data-sonner-toast]").first()).toContainText(/success/i, {
      timeout: 10000,
    });
  });
});
