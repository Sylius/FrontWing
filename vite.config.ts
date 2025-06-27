// vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
      routes: async (defineRoutes) => {
        return defineRoutes((route) => {
          // Core
          route("/", "routes/Homepage.tsx");
          route("/login", "routes/LoginPage.tsx");
          route("/register", "routes/RegisterPage.tsx");
          route("/register/thank-you", "routes/RegisterThankYouPage.tsx");
          route("/forgotten-password", "routes/ForgottenPasswordPage.tsx");
          route("/forgotten-password/reset", "routes/ResetPasswordPage.tsx");
          route("/verify", "routes/VerificationPage.tsx");
          route("/cart", "routes/CartPage.tsx");

          // Product
          route("/product/:code/review/new", "routes/Product/AddReviewPage.tsx");
          route("/product/:code/reviews", "routes/Product/ReviewsListPage.tsx");
          route("/product/:code", "routes/Product/ProductPage.tsx");

          // ✅ Taxon routes (nowa struktura)
          route("/category/:code", "routes/Product/ProductList.tsx");
          route("/category/:parentCode/:childCode", "routes/Product/ProductList.tsx", {
            id: "routes/Product/ProductListChild",
          });

          // ✅ Fallback dla starych URL-i (np. /caps/simple_caps)
          route("/:parentCode/:childCode", "routes/Product/ProductList.tsx", {
            id: "routes/Product/ProductListLegacy",
          });
          route("/:code", "routes/Product/ProductList.tsx", {
            id: "routes/Product/ProductListRootLegacy",
          });

          // Checkout
          route("/checkout/address", "routes/Checkout/AddressPage.tsx");
          route("/checkout/select-shipping", "routes/Checkout/ShippingPage.tsx");
          route("/checkout/select-payment", "routes/Checkout/PaymentPage.tsx");
          route("/checkout/complete", "routes/Checkout/SummaryPage.tsx");
          route("/order/thank-you", "routes/Checkout/ThankYouPage.tsx");

          // Account
          route("/account/dashboard", "routes/account/DashboardPage.tsx");
          route("/account/profile/edit", "routes/account/ProfilePage.tsx");
          route("/account/change-password", "routes/account/ChangePasswordPage.tsx");
          route("/account/order-history", "routes/account/OrderHistoryPage.tsx");
          route("/account/orders/:token", "routes/account/OrderDetailsPage.tsx");
          route("/account/orders/:token/pay", "routes/Checkout/PayOrderPage.tsx");
          route("/account/address-book", "routes/account/AddressBookPage.tsx");
          route("/account/address-book/add", "routes/account/AddAddressPage.tsx");
          route("/account/address-book/edit/:id", "routes/account/EditAddressPage.tsx");
        });
      },
    }),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs",
    },
  },
});
