# AGENTS.md

## Project Overview

This is a full-stack web application built with modern technologies:

- **Runtime**: Bun (fast all-in-one JavaScript runtime)
- **Framework**: Nuxt 4 (Vue 3 + CSR/Prerender/ISR)
- **UI Components**: shadcn-vue (Radix Vue primitives + Tailwind CSS 4)
- **Authentication**: Better Auth
- **Database ORM**: Drizzle ORM
- **Database**: Neon (Serverless Postgres)

## Tech Stack Details

### Frontend

- **Nuxt 4**: Latest version with CSR, Prerender, and ISR (No SSR)
- **Vue 3**: Composition API, script setup syntax
- **shadcn-vue**: Copy-paste component library with customizable UI primitives
- **Tailwind CSS 4**: Utility-first styling with the new CSS-first engine
- **TypeScript**: Full type safety across the project

### Backend & Runtime

- **Bun**: Fast all-in-one JavaScript runtime (replaces Node.js)
- **Nuxt Server Routes**: API endpoints in `server/api/`
- **Better Auth**: Modern authentication library with multiple provider support
- **Drizzle ORM**: TypeScript-first ORM with type-safe queries
- **Neon**: Serverless Postgres with branching capabilities

## Project Structure

```
project-root/
├── .agent/                      # Folder untuk instruksi, aturan (.agent/rules), dan workflow agen AI
├── .netlify/                    # Konfigurasi internal Netlify (seperti edge-functions)
├── .nuxt/                       # File temporary hasil build engine Nuxt (auto-generated)
├── .output/                     # Hasil build final untuk produksi dan deployment
├── app/                         # Direktori utama source code aplikasi (Nuxt 4 structure)
│   ├── assets/                  # Aset aplikasi (global CSS, images, fonts, dll)
│   │   └── css/main.css         # Entry point styling Tailwind CSS
│   ├── components/              # Komponen Vue yang dapat digunakan kembali
│   │   └── ui/                  # Komponen UI shadcn-vue (hanya nama folder)
│   │       ├── accordion/       ├── alert/            ├── alert-dialog/
│   │       ├── aspect-ratio/    ├── avatar/           ├── badge/
│   │       ├── breadcrumb/      ├── button/           ├── button-group/
│   │       ├── calendar/        ├── card/             ├── carousel/
│   │       ├── chart/           ├── checkbox/         ├── collapsible/
│   │       ├── combobox/        ├── command/          ├── context-menu/
│   │       ├── dialog/          ├── drawer/           ├── dropdown-menu/
│   │       ├── empty/           ├── field/            ├── form/
│   │       ├── hover-card/      ├── input/            ├── input-group/
│   │       ├── input-otp/       ├── item/             ├── kbd/
│   │       ├── label/           ├── menubar/          ├── native-select/
│   │       ├── navigation-menu/ ├── number-field/     ├── pagination/
│   │       ├── pin-input/       ├── popover/          ├── progress/
│   │       ├── radio-group/     ├── range-calendar/   ├── resizable/
│   │       ├── scroll-area/     ├── select/           ├── separator/
│   │       ├── sheet/           ├── sidebar/          ├── skeleton/
│   │       ├── slider/          ├── sonner/           ├── spinner/
│   │       ├── stepper/         ├── switch/           ├── table/
│   │       ├── tabs/            ├── tags-input/       ├── textarea/
│   │       ├── toggle/          ├── toggle-group/     ├── tooltip/
│   ├── composables/             # Vue composables untuk reusable logic (State/Logic)
│   ├── layouts/                 # Layout dasar aplikasi Nuxt
│   ├── middleware/              # Route middleware untuk proteksi halaman (client-side)
│   ├── pages/                   # File-based routing (setiap file .vue menjadi route)
│   ├── plugins/                 # Plugin Nuxt (seperti ssr-width.ts)
│   ├── utils/                   # Fungsi utilitas aplikasi (auto-imported)
│   ├── app.config.ts            # Reactive application configuration
│   ├── app.vue                  # Komponen root aplikasi Vue
│   └── error.vue                # Halaman error custom Nuxt
├── public/                      # File statis yang diakses langsung (favicon.ico, robots.txt)
├── server/                      # Direktori backend/server-side (Nitro engine)
│   ├── api/                     # Endpoint API server
│   ├── db/                      # Konfigurasi database, skema, dan migrasi (Drizzle)
│   ├── middleware/              # Middleware khusus server-side
│   ├── plugins/                 # Nitro server plugins
│   ├── routes/                  # Custom server routes
│   └── utils/                   # Helper functions khusus server-side
├── shared/                      # Kode yang dibagikan secara universal (Client & Server)
│   ├── types/                   # Definisi tipe TypeScript global
│   └── utils/                   # Fungsi utilitas framework-agnostic
├── test/                        # Kumpulan file pengujian (Unit, E2E, Integration)
│   ├── e2e/                     # End-to-end tests (Playwright)
│   ├── nuxt/                    # Nuxt-specific tests
│   └── unit/                    # Unit tests (Vitest)
├── .env                         # Konfigurasi variabel lingkungan (secret keys)
├── .nuxtrc                      # Konfigurasi runtime Nuxt
├── .nuxtignore                  # Daftar file/folder yang diabaikan saat build Nuxt
├── .prettierignore              # Daftar file/folder yang diabaikan oleh Prettier
├── .prettierrc                  # Konfigurasi code formatter Prettier
├── AGENTS.md                    # Dokumentasi panduan untuk AI Agent (file ini)
├── README.md                    # Dokumentasi utama proyek untuk manusia
├── bun.lock                     # Lockfile untuk dependensi Bun runtime
├── components.json              # Konfigurasi framework shadcn-vue
├── drizzle.config.ts            # Konfigurasi Drizzle ORM
├── eslint.config.mjs            # Konfigurasi linting ESLint
├── netlify.toml                 # Konfigurasi deployment ke Netlify
├── nuxt.config.ts               # File konfigurasi utama framework Nuxt
├── package.json                 # Definisi proyek, script, dan daftar dependensi
├── playwright.config.ts         # Konfigurasi framework E2E Playwright
├── tsconfig.json                # Konfigurasi compiler TypeScript
└── vitest.config.ts             # Konfigurasi framework testing Vitest
```

## Key Files and Their Purpose

### Configuration Files

**`nuxt.config.ts`**

- Main Nuxt configuration
- Module registration (Better Auth, etc.)
- Runtime config for environment variables
- Build and optimization settings

**`drizzle.config.ts`**

- Database connection configuration
- Migration settings
- Schema path definitions

**`main.css`**

- Tailwind theme customization
- shadcn-vue color schemes (handled via CSS variables in v4)
- Plugin configurations (integrated in @theme)

### Database Files

**`server/db/schema.ts`**

- Drizzle table schemas
- Relationships between tables
- Type definitions for database entities

**`server/db/db.ts`**

- Database connection setup
- Neon client initialization
- Drizzle instance export

### Shared Code

**`shared/utils/`**

- Auto-imported utilities available in both client and server
- Pure functions without Vue or Nitro dependencies
- Examples: formatters, validators, constants

**`shared/types/`**

- Auto-imported TypeScript types for both client and server
- Shared interfaces and type definitions
- DTOs (Data Transfer Objects)

**Important Rules for `shared/`:**

- Cannot import Vue components or composables
- Cannot import Nitro server utilities
- Must be framework-agnostic code
- Only `shared/utils/` and `shared/types/` are auto-imported
- Other files need manual import using `#shared` alias

### Authentication

**Better Auth Integration**

- Configuration in `server/api/auth/[...all].ts` or dedicated auth plugin
- Session management
- OAuth providers setup
- User model integration with Drizzle

## Development Guidelines

### Adding New Features

1. **Database Changes**:
   - Define schema in `server/db/schema.ts`
   - Generate migration: `bun run db:generate`
   - Apply migration: `bun run db:migrate`

2. **API Endpoints**:
   - Create in `server/api/` directory
   - Use `defineEventHandler` for route handlers
   - Implement validation with Zod or similar
   - Use Drizzle for database queries

3. **Shared Utilities** (Client + Server):
   - Add to `shared/utils/` for auto-import
   - Add to `shared/types/` for shared types
   - Must be framework-agnostic (no Vue/Nitro imports)
   - Example use cases: validators, formatters, constants, DTOs

4. **UI Components**:
   - Use shadcn-vue CLI: `bunx shadcn-vue@latest add [component]`
   - Customize in `components/ui/`
   - Follow Tailwind conventions

5. **Pages & Routing**:
   - Add `.vue` files in `pages/` directory
   - Use Nuxt's file-based routing
   - Implement middleware for protected routes

### Code Style & Conventions

- Use **Composition API** with `<script setup>` syntax
- TypeScript for all new files
- Use `composables/` for reusable logic
- Prefer server-side data fetching with `useFetch` or `useAsyncData`
- Use auto-imported Nuxt utilities (no need to import `ref`, `computed`, etc.)

### Import Path Conventions (Required)

- For files inside `app/`, always use `@/` alias (example: `@/components/ui/button`)
- For files inside `server/`, always use `#server` alias (example: `#server/db/db`)
- For files inside `shared/`, always use `#shared` alias (example: `#shared/types/user`)
- Avoid using relative paths (`../../`) and avoid `~/server/*` or `~/shared/*`

### Form Standards (Required: Zod + vee-validate)

- Every new form must use `zod` schema validation and `vee-validate`
- Use `toTypedSchema` from `@vee-validate/zod` to connect Zod schema to `vee-validate`
- Use shadcn-vue form primitives in `app/components/ui/form/`

Example (`shadcn-vue` + `vee-validate` + `zod`):

```vue
<script setup lang="ts">
  import { z } from 'zod'
  import { useForm } from 'vee-validate'
  import { toTypedSchema } from '@vee-validate/zod'

  const formSchema = toTypedSchema(
    z.object({
      email: z.string().email('Please enter a valid email address'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
    })
  )

  const form = useForm({
    validationSchema: formSchema,
    initialValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    // call API
    console.log(values)
  })
</script>

<template>
  <form class="space-y-6" @submit="onSubmit">
    <FormField v-slot="{ componentField }" name="email">
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input type="email" placeholder="email@example.com" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="password">
      <FormItem>
        <FormLabel>Password</FormLabel>
        <FormControl>
          <Input type="password" placeholder="********" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <Button type="submit">Submit</Button>
  </form>
</template>
```

### Authentication Patterns

```typescript
// Protected API route example
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  // Your logic here
})

// Protected page with middleware
definePageMeta({
  middleware: 'auth',
})
```

### Database Query Patterns

```typescript
// server/api/example.get.ts
import { db } from '#server/db/db'
import { users } from '#server/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = event.context.user.id

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })

  return user
})
```

### Shared Code Patterns

**Auto-imported utilities** (`shared/utils/`):

```typescript
// shared/utils/formatters.ts
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(amount)
}

export const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Usage in components or server
const price = formatCurrency(100000) // Auto-imported!
```

**Shared types** (`shared/types/`):

```typescript
// shared/types/user.ts
export interface UserDTO {
  id: string
  email: string
  name: string
  createdAt: Date
}

export type UserRole = 'admin' | 'user' | 'guest'

// Usage anywhere
const user: UserDTO = {
  /* ... */
} // Auto-imported!
```

**Manual imports** (files not in utils/ or types/):

```typescript
// shared/constants.ts
export const APP_NAME = 'My App'
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Usage - must import manually
import { APP_NAME } from '#shared/constants'
```

## Environment Variables

Required environment variables (add to `.env`):

```bash
# Database
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# OAuth Providers (if using)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Other
NUXT_PUBLIC_API_BASE=/api
```

## Common Commands

```bash
# Development
bun run dev                 # Start dev server
bun run build              # Build for production
bun run preview            # Preview production build

# Database
bun run db:generate        # Generate Drizzle migrations
bun run db:migrate         # Run migrations
bun run db:push            # Push schema changes (dev only)
bun run db:studio          # Open Drizzle Studio

# Code Quality
bun run lint               # Run ESLint
bun run type-check         # TypeScript type checking

# Package Management
bun install                # Install dependencies
bun add <package>          # Add dependency
bun add -d <package>       # Add dev dependency
bun remove <package>       # Remove dependency
```

## Testing Approach

- **Unit Tests**: For utilities and composables
- **Integration Tests**: For API endpoints
- **E2E Tests**: For critical user flows
- Use Vitest for unit/integration tests
- Use Playwright for E2E tests

## Deployment Considerations

### Runtime: Bun

- This project uses **Bun** as the JavaScript runtime
- Faster package installation and execution compared to Node.js
- Native TypeScript support without transpilation
- Ensure deployment platform supports Bun or use Docker

### Netlify

- Nuxt has first-class support
- Configure for Bun runtime in platform settings
- Set environment variables in platform dashboard
- Build command: `bun run build`

### Docker Deployment

```dockerfile
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build
COPY . .
RUN bun run build

# Production
EXPOSE 3000
CMD ["bun", "run", ".output/server/index.mjs"]
```

### Database Migrations

- Run migrations before deployment
- Use Neon branching for preview deployments
- Keep production migrations backward compatible

### Environment Setup

- Use different DATABASE_URL for staging/production
- Rotate BETTER_AUTH_SECRET for each environment
- Configure CORS if needed for external APIs

## AI Agent Instructions

When working with this codebase:

1. **Always check** existing patterns before suggesting new approaches
2. **Respect** the TypeScript-first nature of the stack
3. **Follow** shadcn-vue conventions for UI components
4. **Use** Drizzle ORM query builder, not raw SQL
5. **Leverage** Nuxt's auto-imports (composables, components, utils)
6. **Consider** CSR, Prerendering, and ISR implications (No SSR)
7. **Validate** user input on both client and server
8. **Handle** authentication state properly with Better Auth
9. **Test** database queries in Drizzle Studio before implementation
10. **Document** complex business logic inline
11. **Use `shared/` directory** for code needed by both client and server
12. **Keep `shared/` pure**: No Vue or Nitro imports in shared code
13. **Prefer Bun** commands over npm/npx in scripts and documentation

## Troubleshooting

### Common Issues

**Database Connection Errors**:

- Verify DATABASE_URL format
- Check Neon project is active
- Ensure IP allowlist includes your location (if configured)

**Authentication Issues**:

- Verify BETTER_AUTH_SECRET is set
- Check session configuration
- Ensure cookies are enabled in browser

**Build Errors**:

- Clear `.nuxt` and `.output` directories
- Delete `node_modules` and reinstall with `bun install`
- Check TypeScript errors with `bun run type-check`
- Clear Bun cache: `bun pm cache rm`

**Styling Issues**:

- Verify Tailwind config includes shadcn-vue presets
- Check component imports are correct
- Ensure CSS is being processed

## Resources

- [Nuxt 4 Documentation](https://nuxt.com)
- [shadcn-vue Documentation](https://www.shadcn-vue.com)
- [Better Auth Documentation](https://www.better-auth.com)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Neon Documentation](https://neon.tech/docs)
- [Bun Documentation](https://bun.sh/docs)

## Project-Specific Notes

[Add any project-specific conventions, business logic notes, or special considerations here]

---

**Last Updated**: 17 Feb 2026
**Maintainers**: Adam Abdurrahman
