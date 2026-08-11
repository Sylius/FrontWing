import "i18next";

import type common from "../public/locales/en/common.json";
import type product from "../public/locales/en/product.json";
import type cart from "../public/locales/en/cart.json";
import type checkout from "../public/locales/en/checkout.json";
import type account from "../public/locales/en/account.json";

declare module "i18next" {
    interface CustomTypeOptions {
        defaultNS: "common";
        resources: {
            common: typeof common;
            product: typeof product;
            cart: typeof cart;
            checkout: typeof checkout;
            account: typeof account;
        };
    }
}
