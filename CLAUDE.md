# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Read the rules first

**All code in this project must follow [`.claude/rules/clean-code.md`](.claude/rules/clean-code.md).**
Read it before writing or reviewing any code. The most important points:

- **Never write comments in code.** Names must explain everything.
- **Componentize everything.** Anything used twice becomes a component, composable or constant.
- **Descriptive names everywhere:** variables, functions, constants, files, props and tokens.
- **Use the design system.** Theme tokens, `Base*` components and `app-icons.ts`. No raw colors.
- **Dark mode and mobile first** for every component. Light is the default theme.
- **Variant types are plain unions**, one `<script setup lang="ts">` per component, classes live in
  the component's `.vue` file.
- **Every text the user reads is in Brazilian Portuguese.** Code, names and commits stay in English.

## What this project is

Doca organizes Amazon FBA shipments for several companies. Each company has its own account with
brands, products (FNSKU and label) and shipments. A shipment keeps the Amazon box sheet, the box
contents, the shipping label, the DANFE and the pickup date, so nobody needs local folders or
emailing files to print them.

The full plan, phases and decisions live in the Doca plan doc:
https://claude.ai/artifact/LWmtjTSX72d4nP1FUo8uV8

### Roles

| Role | Can |
| --- | --- |
| Admin (`profiles.is_admin`) | Everything, in every company, including deleting and creating companies |
| Manager (`company_members.role = 'manager'`) | Read, create and edit in their linked companies, link people to them. Never delete |
| Client (`company_members.role = 'client'`) | Read their one company: shipments, boxes, files, progress |

Permissions are enforced by Postgres RLS through `private.*` helper functions. Hiding a button is
only the visual layer.

### Delivery plan

0. **Foundation** (done): repository, design system, sign in, layout, motion.
1. **Companies, people, brands and products** (done): company switcher, invites through the
   `invite-member` Edge Function, set-password page, catalog with FNSKU labels in Storage.
2. **Register a shipment** (next): Amazon box sheet, box grid, label, DANFE, pickup.
3. Tracking, one-file printing, history import from the old `FBA_ENVIOS` folders.
4. Amazon SP-API, reading.
5. Create shipments through Doca.
6. Extras.

## Commands

This project uses **pnpm**. Never use npm or yarn.

```sh
pnpm install          # install the Supabase CLI, then the web app's dependencies
pnpm dev              # start the Vite dev server for web/
pnpm build            # type-check and build web/ for production
pnpm type-check       # run vue-tsc only
pnpm format           # format web/src/ with Prettier
pnpm supabase <args>  # run the Supabase CLI
```

Always run `pnpm build` before declaring work done. It must pass with no type errors.

## Project structure

```
web/src/
  theme/
    theme.css              Tokens: sky brand scale, slate-blue neutrals, Plus Jakarta Sans,
                           radii (control 14px, tile 18px, card 24px), shadows, animations
    color-variants.ts      ColorVariant, Appearance, FieldStatus and TextTone unions
    component-sizes.ts     ControlSize and IconSize unions
    app-icons.ts           Every Hugeicons icon the app uses, under a descriptive name
  components/
    button/                BaseButton, BaseIconButton
    card/                  BaseCard, BaseDisclosureCard (collapsible, closed by default)
    table/                 BaseDataTable (sortable columns, cell-<key> slots, staggered rows)
    form/                  BaseFormField, BaseInput (mask, prefix and suffix props), BaseSelect,
                           BaseTextarea, BaseFileDrop, BaseSegmentedControl
    document/              DocumentViewerDialog (mounted once in AppLayoutView, opened through
                           document-viewer-store) and PdfPages (pdf.js, lazy loaded, renders every page)
    gallery/               Pieces of the /components test page (admins only): masked inputs,
                           input styles and toasts
    icon/                  BaseIcon, BaseIconCircle, BaseSpinner
    menu/                  BaseDropdownMenu, BaseDropdownMenuItem
    toast/                 BaseToast, ToastViewport (top layer, so it shows over modals). Tones:
                           success, danger, warning, info, neutral; optional person and action;
                           countdown bar that pauses on hover
    tooltip/               BaseTooltip
    typography/            BaseText, BaseHeading
    avatar/ badge/         BaseAvatar, BaseBadge
    feedback/              EmptyState, ComingInPhaseNotice
    motion/                StaggeredTransitionGroup
    layout/                AppSidebar, SidebarNavigationLink, AppMobileBar, MobileNavigation,
                           PageHeader, PageBreadcrumbs, AccountMenu, AppBrandMark, PageTransition,
                           navigation-destinations.ts (every menu entry, its section and role)
    authentication/        SignInForm, SignInLinkSentNotice
  formatting/              input-masks.ts (every mask: cpf, cnpj, phone, cep, date, time, money,
                           integer, decimal, percent, weight, length, amazon-code; the model
                           keeps the raw value, like digits, 1234.56 or 2026-11-15) and
                           brazilian-documents.ts (CPF/CNPJ check digits)
  composables/             use-color-scheme (with the theme reveal), use-form-field-accessibility,
                           use-visible-navigation, use-sliding-indicator
  services/                supabase-client, profiles-service, describe-error, describe-sign-in-error
  stores/                  authentication-store, current-user-store, sidebar-store, toast-store
  router/                  Routes in English paths (UI text stays Portuguese), auth guard, page titles
                           from route meta. route-audience.ts is the single access rule: each route's
                           meta.audience (everyone, editors, people-linkers, admins) both hides the
                           menu entry and makes the guard redirect home with a toast. Unknown paths
                           render NotFoundView; ForbiddenView (403) is the fallback
  views/                   SignInView, AppLayoutView and one view per section. CompaniesView
                           (/companies) only lists companies as cards or a table; each opens
                           CompanyOverviewView (/companies/:id), the admin page with stats,
                           alerts, brands, products and the Acessos section (members, invite,
                           unlink, role permissions)
supabase/
  config.toml              Source of truth for auth settings
  migrations/              Plain SQL, no comments
  templates/               Auth emails. Edit build-email-templates.mjs and run it with node; it writes
                           the HTML files that config.toml points to. Emails go out through Resend
                           SMTP ([auth.email.smtp]); the gitignored supabase/.env holds
                           RESEND_API_KEY and EMAIL_SENDER_ADDRESS (see supabase/.env.example), and
                           must be filled before any config push
```

## Motion

Doca is meant to feel bouncy and fluid. Every new component follows these patterns:

- **Easing tokens** in `theme.css`: `ease-bounce` (overshoot, for things that appear or move),
  `ease-spring` (softer, for sizes and sliding highlights), `ease-glide` (no overshoot). Leaving
  elements use a short `ease-in`.
- **Keyframes**: `animate-pop-in` (logo, chips), `animate-rise-in` (cards), `animate-icon-pop` (an
  icon that becomes active), `animate-float` (idle illustrations).
- **Lists and groups of design pieces** enter staggered through
  `components/motion/StaggeredTransitionGroup.vue`: a `TransitionGroup` with JavaScript hooks and the
  Web Animations API. Give every child a `key` and a `data-stagger-index`.
- **Single swaps** (page, title, form ↔ success notice) use `<Transition mode="out-in">` with
  `ease-bounce` on enter.
- **Active navigation** uses `use-sliding-indicator.ts`: one highlight that slides to the item with
  `aria-current="page"`, measured with `useResizeObserver` and `useMutationObserver`.
- **Theme switch** uses the View Transitions API: a circle grows from the pointer (`useMouse`).
- **Buttons** lift on hover and squish on press, all with `ease-bounce`.
- **Reduced motion** is always respected: `motion-reduce:transition-none` on CSS transitions,
  `usePreferredReducedMotion` in JavaScript animations, and a global reduce rule in `theme.css`.

The base components came from the screenshare project and were restyled for Doca. For complex
widgets that the base set does not cover yet (calendar, dialog, combobox), add shadcn-vue (Reka UI)
components and wrap them in a `Base*` component so the rest of the app never imports them directly.

## Git and CI

- Work happens on `release/next` (the default branch) or branches off it. Nothing is committed to
  `main` directly: a ruleset blocks pushes, force pushes and deletion, and `main` only changes
  through a pull request from `release/next` (checked by the Pull request source workflow) with
  Secret scan, Commit lint and Source branch passing.
- Commit messages follow Conventional Commits (`feat: ...`, `fix: ...`, `chore: ...`), checked by
  the Commit lint workflow with `commitlint.config.mjs`.
- The Secret scan workflow runs Gitleaks over the full history on every push and pull request.
  The repo is public: secrets and the Supabase project reference only live in gitignored `.env`
  files and in the hosting provider's environment variables.

## Supabase

The backend is the Supabase project `doca`, region `sa-east-1`, free plan. The repo is public, so
the project reference never goes into tracked files: it lives in `SUPABASE_PROJECT_REF` in the
gitignored `supabase/.env` (see `supabase/.env.example`) and in the CLI link under `supabase/.temp`.
The same account holds the `screenshare` project, so always use that reference.

- **CLI:** a dev dependency, run with `pnpm supabase <command>`. Link a fresh clone with
  `pnpm supabase link --project-ref <SUPABASE_PROJECT_REF>`.
- **Deploy env:** the web app only needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
  (see `web/.env.example`). Set them in the hosting provider (Vercel) for production.
- **Config:** `supabase/config.toml` overwrites the live project on push. Run
  `pnpm supabase config diff` first and push only when the diff holds nothing but the intended
  change.
- **Sign in:** email and password, or a magic link. Self sign up is off (`[auth] enable_signup =
  false`): people only get in through an invite. Keep `[auth.email] enable_signup = true`: that key
  turns the whole email provider on or off, and setting it to false blocks every email login.
- **Frontend env:** the gitignored `web/.env.local` holds `VITE_SUPABASE_URL` and
  `VITE_SUPABASE_PUBLISHABLE_KEY`.
- **Secrets:** never write a secret key into a tracked file, a local env file or a chat message.
- **Migrations:** `pnpm supabase migration new <descriptive_name>`, plain SQL without comments,
  preview with `pnpm supabase db push --linked --dry-run`, apply with
  `pnpm supabase db push --linked`. Never edit a pushed migration: add a new one.
- **Advisors:** run `pnpm supabase db advisors --linked` after every migration and fix new warnings.
- **Edge Functions:** live in `supabase/functions/`. Deploy with
  `pnpm supabase functions deploy <name> --use-api < /dev/null`. `invite-member` checks that the
  caller is an admin or a manager of the company, invites new people by email (redirecting to
  `/set-password`) or links people who already have an account, then creates the membership.
- **Storage:** private bucket `documents`, paths start with the company id
  (`{company_id}/products/{product_id}.pdf`). Policies reuse `private.can_read_company` and
  `private.can_edit_company`. Files open through short signed URLs.
- **CLI gotcha:** commands that may read stdin (`migration new`, `db push`, `functions deploy`)
  hang in a non-interactive shell. Always append `< /dev/null`.
- **Admin:** an admin is a `profiles` row with `is_admin = true`. A profile is created by the
  `create_profile_after_user_signs_up` trigger when an auth user is created.
