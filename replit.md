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
- `/menu` — Categorized menu with search/filter, food photos, and cart/ordering system
- `/gallery` — Photo gallery with lightbox/zoom
- `/contact` — Inquiry form with contact info + branch locations display

**Auth:**
- `/admin/login` — Login page (JWT-based, stored in localStorage)
- Default admin: `mukesh@mailinator.com` / `Mukesh@#!123`
- All admin routes are protected and redirect to login if unauthenticated

**Admin Panel:**
- `/admin` — Dashboard with stats
- `/admin/orders` — Customer orders (view, edit, add, accept, digital bill generation)
- `/admin/content` — Edit all site content (hero, about, contact info, social links)
- `/admin/branches` — Manage branch locations (shown on Contact page)
- `/admin/theme` — Color picker for primary/secondary/accent colors + font family
- `/admin/menu` — Add/edit/delete menu categories and items
- `/admin/gallery` — Add/edit/delete gallery images
- `/admin/inquiries` — View and delete customer inquiries
- `/admin/analytics` — Charts: inquiries by month, orders growth, top menu items, unique devices
- `/admin/users` — Create and manage admin panel users (passwords hashed with bcrypt)

**Contexts:**
- `AuthContext` — JWT authentication
- `CartContext` — Shopping cart state for the menu page
- `ThemeContext` — Live theme color application

### API Server (`artifacts/api-server`)
Express API at preview path `/api`.

**Routes:**
- `/api/site-content` — GET/PUT site content
- `/api/theme` — GET/PUT theme settings
- `/api/menu-categories` — CRUD menu categories
- `/api/menu-items` — CRUD menu items (filterable by categoryId)
- `/api/gallery-images` — CRUD gallery images
- `/api/inquiries` — GET/POST/DELETE inquiries
- `/api/auth/login` — POST login (returns JWT)
- `/api/auth/me` — GET current user (requires Bearer token)
- `/api/orders` — CRUD orders (POST public, others require auth)
- `/api/orders/:id/accept` — PATCH accept order (auth required)
- `/api/admin-users` — CRUD admin users (auth required, passwords bcrypt-hashed)
- `/api/branches` — CRUD branch locations (GET public, others auth required)
- `/api/analytics` — GET analytics aggregates (auth required)
- `/api/track` — POST page view tracking (public)

## DB Schema

- `site_content` — Single row with all site text/images/contact info
- `theme_settings` — Single row with primary/secondary/accent colors and font
- `menu_categories` — Menu category names, descriptions, icons
- `menu_items` — Individual items with price, image, tags, available/featured flags
- `gallery_images` — Gallery photo URLs with captions and alt text
- `inquiries` — Customer messages from the contact form
- `orders` — Customer orders with status (pending/preparing/ready/accepted/cancelled)
- `order_items` — Individual items within an order (name, price, quantity)
- `admin_users` — Admin panel users with bcrypt-hashed passwords
- `branches` — Restaurant branch locations (shown on Contact page)
- `page_views` — Page view tracking with device ID for analytics

## Auth

JWT-based authentication for admin panel. Token stored in localStorage (`admin_token`). Server uses `jsonwebtoken` to sign/verify. Passwords hashed with `bcryptjs` (12 rounds). Default admin user seeded on server startup.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
