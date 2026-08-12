import { HydratedRouter } from "react-router/dom";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import 'yet-another-react-lightbox/styles.css';

import { createClientI18n } from "~/i18n.client";

async function hydrate() {
  const i18n = await createClientI18n(window.__I18N__!);

  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <I18nextProvider i18n={i18n}>
          <HydratedRouter />
        </I18nextProvider>
      </StrictMode>
    );
  });
}

hydrate();
