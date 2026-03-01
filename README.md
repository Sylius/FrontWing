# FrontWing — Headless Sylius Frontend

A modern, headless React 19 frontend for [Sylius](https://sylius.com) e-commerce platform, built with Vite 7, TypeScript 5.9, TailwindCSS v4, and shadcn/ui.

> ℹ️ **Status**: This project is in active development. Core e-commerce features are implemented and functional, with ongoing improvements and optimizations.

---

## Tech Stack

- **React** 19 — UI library
- **Vite** 7 — Build tool and development server
- **TypeScript** 5.9 — Type-safe development
- **TailwindCSS** v4 — Utility-first CSS with `@tailwindcss/vite` plugin
- **shadcn/ui** — Component library with Base UI (`base-vega` style) primitives
- **TanStack Query** — Server state management
- **react-router-dom** — Client-side routing
- **pnpm** — Package manager
- **Sonner** — Toast notifications

---

## Features

- 🧩 Component-driven architecture with shadcn/ui
- ⚡ Lightning-fast Vite development with HMR
- 🎨 TailwindCSS v4 styling + shadcn/ui components
- 🛒 Full Sylius API v2 integration:
  - Homepage and category listing
  - Product detail pages with reviews
  - Shopping cart with discount support
  - Multi-step checkout flow
  - Customer account (dashboard, order history, profile, address book)
- 📱 Responsive mobile-first design
- ♿ Accessibility-focused component patterns
- 🔄 Client-side routing with React Router

---

## UI Library

This project uses **shadcn/ui** component library backed by **Base UI** (`base-vega` style) primitives, providing production-ready components with full TypeScript support and accessibility out of the box. Available components include Button, Input, Textarea, Select, Table, Badge, Alert, Checkbox, Accordion, Breadcrumb, Card, Sheet (mobile navigation), NavigationMenu (desktop navigation), DropdownMenu, Separator, Label, and Sonner for toast notifications.

---

## Getting Started

**Requirements:** Node.js v20+, pnpm v10+

**Setup:**

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open http://localhost:5137 in your browser to see the frontend connected to your Sylius API.

**Build for production:**

```bash
pnpm build
pnpm preview
```

---

## Development Roadmap

Planned features and improvements:

- [ ] Server-side rendering (SSR) optimization
- [ ] Internationalization (i18n) and multilingual support
- [ ] Enhanced frontend form validation
- [ ] API query optimization
- [ ] Performance monitoring and analytics
- [ ] E2E testing with Playwright

---

## Community

Have questions or want to contribute? Join the Sylius Slack community in the `#react-front` channel:

👉 https://sylius.com/slack

---

## License

FrontWing is released under the [MIT License](https://github.com/Sylius/Sylius/blob/master/LICENSE).

## Contributing

Contributions are welcome! Feel free to:
- Open an issue for bugs or feature requests
- Submit pull requests with improvements
- Share feedback and ideas
