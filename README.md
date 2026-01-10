# Sentinel

Sentinel frontend built with Nuxt 4, Vue 3, PrimeVue, and TailwindCSS.

## Tech Stack

- **Framework:** Nuxt 4 / Vue 3
- **UI Components:** PrimeVue 4
- **Styling:** TailwindCSS
- **Icons:** Lucide (via @iconify-json/lucide)
- **State Management:** Pinia
- **Package Manager:** pnpm

## Setup

```bash
pnpm install
```

> **Note:** If prompted about build scripts, run `pnpm approve-builds` and approve the required packages.

## Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `pnpm dev`      | Start development server |
| `pnpm build`    | Build for production     |
| `pnpm preview`  | Preview production build |
| `pnpm lint`     | Run ESLint               |
| `pnpm lint:fix` | Run ESLint with auto-fix |

## Production

```bash
pnpm build
pnpm preview
```

## Documentation

See the [docs](./docs) folder for detailed documentation:

- [Design System](./docs/frontend/DESIGN_SYSTEM.md)
- [Frontend Architecture](./docs/frontend/FRONTEND_ARCHITECTURE.md)
- [Component Standards](./docs/frontend/COMPONENT_STANDARDS.md)
- [State & Data](./docs/frontend/STATE_AND_DATA.md)
