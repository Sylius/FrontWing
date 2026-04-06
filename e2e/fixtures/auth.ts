import { test as base, type Page } from "@playwright/test";
import * as fs from "fs";

const authFile = new URL("../.auth/user.json", import.meta.url).pathname;

export async function globalSetup() {
  const email = process.env.PLAYWRIGHT_TEST_EMAIL || "test@example.com";
  const password = process.env.PLAYWRIGHT_TEST_PASSWORD || "Password123!";
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5173";
  const apiUrl = process.env.VITE_REACT_APP_API_URL || "http://localhost:8000";

  try {
    const response = await fetch(`${apiUrl}/api/v2/shop/customers/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      throw new Error(`Auth failed: ${response.statusText}`);
    }

    const data: { token: string; customer: string } = await response.json();

    // Ensure .auth directory exists
    const authDir = new URL("../.auth", import.meta.url).pathname;
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    // Save storage state with JWT token
    const storageState = {
      cookies: [],
      origins: [
        {
          origin: baseURL,
          localStorage: [
            {
              name: "jwtToken",
              value: data.token,
            },
            {
              name: "userUrl",
              value: data.customer,
            },
          ],
        },
      ],
    };

    fs.writeFileSync(authFile, JSON.stringify(storageState, null, 2));
    console.log("Auth setup complete: JWT token saved to .auth/user.json");
  } catch (error) {
    console.error("Global setup failed:", error);
    throw error;
  }
}

type AuthFixtures = {
  authenticatedPage: Page;
};

export const authenticatedTest = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Load storage state if it exists
    if (fs.existsSync(authFile)) {
      await page.context().addInitScript(() => {
        const storageState = JSON.parse(localStorage.getItem("__playwright_state__") || "{}");
        if (storageState.jwtToken) {
          localStorage.setItem("jwtToken", storageState.jwtToken);
        }
      });
    }
    await use(page);
  },
});

export default globalSetup;

// Export base test with storage state for authenticated tests
export const test = base.extend({
  page: async ({ page }, use) => {
    if (fs.existsSync(authFile)) {
      await page.context().addInitScript(() => {
        // Manually inject storage state from file
      });
      const state = JSON.parse(fs.readFileSync(authFile, "utf-8"));
      if (state.origins && state.origins[0]?.localStorage) {
        for (const item of state.origins[0].localStorage) {
          await page.evaluate(({ key, value }) => localStorage.setItem(key, value), {
            key: item.name,
            value: item.value,
          });
        }
      }
    }
    await use(page);
  },
});
