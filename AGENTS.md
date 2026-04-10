# Project Instructions

## Route File Rule

For any file matching `app/**/page.tsx`:

- Keep the file as a thin route entry only.
- Import exactly one page-content component from `@/features/**/components/**-page-content`.
- Optionally use type-only imports from `next` for page metadata or viewport typing.
- Export exactly one default page function.
- Have that function directly return the imported page-content component.
- Do not perform server-side data fetching in `app/**/page.tsx`; keep fetching inside the imported
  `@/features/**/components/**-page-content` component or that feature's supporting layers.
- Forward any page props such as `params` and `searchParams` directly to the imported page-content
  component. Example for `app/**/page.tsx`: `export default function Page(props) { return
  <PageContent {...props} />; }`
- You may also export common Next.js page-level config such as `metadata`, `viewport`,
  `revalidate`, `dynamic`, `dynamicParams`, `fetchCache`, `preferredRegion`, `runtime`,
  `maxDuration`, `generateMetadata`, and `generateViewport`.
- Do not place UI markup, hooks, constants, validation, queries, or business logic in `app/**/page.tsx`.

All actual page code must live under `features/<feature>/components/`, with support code in
`features/<feature>/lib`, `features/<feature>/hooks`, `features/<feature>/types`, or
`features/<feature>/api`.

## Feature Component Decomposition Rule

For files under `features/**/components/`:

- Prefer small, focused components over large multi-purpose files.
- Treat `**-page-content.tsx` files as composition/orchestration layers, not as the final home for every piece of UI.
- When a page-content file starts handling multiple UI regions, extract them into feature-local components. Common examples:
  scanner modals, summary cards, data tables, filters, forms, empty states, and feedback banners.
- Move reusable display formatting and pure helpers into `features/<feature>/lib`.
- Move reusable stateful UI behavior into `features/<feature>/hooks` when it is not specific to a single tiny component.
- Keep feature-specific types in `features/<feature>/types`.
- Avoid letting a single component file become the place for unrelated concerns like data fetching, dialog state, table rendering, helper formatting, and form markup all together.
- If a component is getting hard to scan quickly, split it before adding more logic.
- Prefer colocated feature files with descriptive names such as `borrow-summary-cards.tsx`, `borrow-transaction-history.tsx`, or `borrow-scanner-dialog.tsx`.

The goal is to keep files easy to reason about, easy to review, and easy to change without creating oversized page components.
