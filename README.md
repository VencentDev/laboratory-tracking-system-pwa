# Laboratory Tracking System PWA

A Next.js PWA for laboratory inventory, borrowing, returning, barcode labels, and receipt workflows.

## Development

Install dependencies:

```bash
pnpm install
```

Run the app locally:

```bash
pnpm dev
```

Validate changes:

```bash
pnpm typecheck
pnpm lint
```

## Direct Receipt Printing

The app supports two receipt print paths:

- Direct local print bridge first, using `http://localhost:9321/print`
- Browser print fallback through `window.print()`

The local bridge is required for automatic POS-5890U-L printing without the browser print modal.

Start the bridge:

```bash
pnpm print-bridge
```

Build standalone bridge executables:

```bash
pnpm build:print-bridge
```

The packaged outputs are written to `dist-print-bridge/` for Windows and Linux x64. Users can run the executable directly instead of installing Node.js and pnpm.

Default Arch/Linux target:

```txt
/dev/usb/lp0
```

Default bridge URL used by the PWA:

```txt
http://localhost:9321
```

See [Direct Receipt Printing Manual](docs/direct-receipt-printing.md) for Arch Linux, Windows, Vercel deployment, and cashier workflow setup.
