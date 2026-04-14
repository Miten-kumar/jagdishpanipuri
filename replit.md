# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains a full-stack restaurant/cafe website with public pages and an admin panel.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, Tailwind CSS, shadcn/ui, Framer Motion, Wouter

## Artifacts

### Cafe Website (`artifacts/cafe-website`)
Full-stack restaurant/cafe website at preview path `/`.

**Public Pages:**
- `/` — Landing page with hero, featured menu, about preview, gallery preview, categories
- `/about` — About us with story, values, team, and timeline
- `/menu` — Categorized menu with search/filter and food photos
- `/gallery` — Photo gallery with lightbox/zoom
- `/contact` — Inquiry form with contact info

**Admin Panel:**
- `/admin` — Dashboard with stats (menu items, gallery images, inquiries)
- `/admin/content` — Edit all site content (hero, about, contact info, social links)
- `/admin/theme` — Color picker for primary/secondary/accent colors + font family (applied live)
- `/admin/menu` — Add/edit/delete menu categories and items
- `/admin/gallery` — Add/edit/delete gallery images
- `/admin/inquiries` — View and delete customer inquiries

### API Server (`artifacts/api-server`)
Express API at preview path `/api`.

**Routes:**
- `/api/site-content` — GET/PUT site content
- `/api/theme` — GET/PUT theme settings
- `/api/menu-categories` — CRUD menu categories
- `/api/menu-items` — CRUD menu items (filterable by categoryId)
- `/api/gallery-images` — CRUD gallery images
- `/api/inquiries` — GET/POST/DELETE inquiries

## DB Schema

- `site_content` — Single row with all site text/images/contact info
- `theme_settings` — Single row with primary/secondary/accent colors and font
- `menu_categories` — Menu category names, descriptions, icons
- `menu_items` — Individual items with price, image, tags, available/featured flags
- `gallery_images` — Gallery photo URLs with captions and alt text
- `inquiries` — Customer messages from the contact form

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
