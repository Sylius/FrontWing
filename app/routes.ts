import { type RouteConfig, route, index, prefix } from "@react-router/dev/routes";

export default [
  // API (no language prefix)
  route("/api/sync-cart", "routes/api.sync-cart.tsx"),

  ...prefix(":lang", [
    // Core
    index("routes/Homepage.tsx"),
    route("login", "routes/LoginPage.tsx"),
    route("register", "routes/RegisterPage.tsx"),
    route("register/thank-you", "routes/RegisterThankYouPage.tsx"),
    route("forgotten-password", "routes/ForgottenPasswordPage.tsx"),
    route("forgotten-password/reset", "routes/ResetPasswordPage.tsx"),
    route("verify", "routes/VerificationPage.tsx"),
    route("cart", "routes/CartPage.tsx"),

    // Product
    route("product/:code/review/new", "routes/Product/AddReviewPage.tsx"),
    route("product/:code/reviews", "routes/Product/ReviewsListPage.tsx"),
    route("product/:code", "routes/Product/ProductPage.tsx"),

    // Taxon routes
    route("category/:code", "routes/Product/ProductList.tsx"),
    route("category/:parentCode/:childCode", "routes/Product/ProductList.tsx", {
      id: "routes/Product/ProductListChild",
    }),
    route(":parentCode/:childCode", "routes/Product/ProductList.tsx", {
      id: "routes/Product/ProductListLegacy",
    }),
    route(":code", "routes/Product/ProductList.tsx", {
      id: "routes/Product/ProductListRootLegacy",
    }),

    route("checkout", "routes/Checkout/CheckoutRedirect.tsx"),

    // Checkout
    route("checkout/address", "routes/Checkout/AddressPage.tsx"),
    route("checkout/select-shipping", "routes/Checkout/ShippingPage.tsx"),
    route("checkout/select-payment", "routes/Checkout/PaymentPage.tsx"),
    route("checkout/complete", "routes/Checkout/SummaryPage.tsx"),
    route("order/thank-you", "routes/Checkout/ThankYouPage.tsx"),

    // Account
    route("account/dashboard", "routes/account/DashboardPage.tsx"),
    route("account/profile/edit", "routes/account/ProfilePage.tsx"),
    route("account/change-password", "routes/account/ChangePasswordPage.tsx"),
    route("account/order-history", "routes/account/OrderHistoryPage.tsx"),
    route("account/orders/:token", "routes/account/OrderDetailsPage.tsx"),
    route("account/orders/:token/pay", "routes/Checkout/PayOrderPage.tsx"),
    route("account/address-book", "routes/account/AddressBookPage.tsx"),
    route("account/address-book/add", "routes/account/AddAddressPage.tsx"),
    route("account/address-book/edit/:id", "routes/account/EditAddressPage.tsx"),
  ]),
] satisfies RouteConfig;
