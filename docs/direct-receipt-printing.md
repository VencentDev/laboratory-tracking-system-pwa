# Direct Receipt Printing Manual

This manual explains how to print receipts automatically from the Vercel-hosted PWA to a POS-5890U-L receipt printer without opening the browser print dialog.

## Architecture

```txt
PWA hosted on Vercel
  -> http://localhost:9321/print
  -> local print bridge
  -> USB printer
```

The browser cannot reliably print directly to the POS-5890U-L over Bluetooth. Your detected USB printer binds as `usblp0`, so the recommended path is USB plus the local print bridge.

## What The PWA Does

When the user clicks `Done` in a borrow or return scan session:

1. The app builds a plain-text ESC/POS-style receipt.
2. The app sends it to `http://localhost:9321/print`.
3. If the bridge accepts the receipt, printing happens automatically.
4. If the bridge is unavailable, the app falls back to browser printing.

The app reads these optional browser settings from `localStorage`:

```js
localStorage.setItem("receiptPrintMode", "bridge")
localStorage.setItem("receiptPrintBridgeUrl", "http://localhost:9321")
```

To force browser print fallback:

```js
localStorage.setItem("receiptPrintMode", "browser")
```

To re-enable bridge-first printing:

```js
localStorage.removeItem("receiptPrintMode")
```

## Start The Bridge

From the project root:

```bash
pnpm print-bridge
```

Health check:

```bash
curl http://localhost:9321/health
```

Manual print test:

```bash
curl -X POST http://localhost:9321/print \
  -H "Content-Type: application/json" \
  -d '{"receiptType":"test","content":"LAB TRACKING SYSTEM\nTEST PRINT\n\n\n"}'
```

## Arch Linux USB Setup

Your printer was detected as:

```txt
ID 0416:5011 Winbond Electronics Corp. Virtual Com Port
Product: POS-58 Printer
Manufacturer: YICHIP3121
usblp0: USB Bidirectional printer
```

That means the bridge should write to:

```txt
/dev/usb/lp0
```

Confirm the device exists:

```bash
ls -l /dev/usb/lp*
```

Test direct raw printing:

```bash
printf "TEST PRINT\n\n\n" | sudo tee /dev/usb/lp0 > /dev/null
```

Allow your user to print without `sudo`:

```bash
sudo usermod -aG lp "$USER"
```

Log out and log back in, then test:

```bash
printf "TEST PRINT\n\n\n" > /dev/usb/lp0
```

Start the bridge:

```bash
pnpm print-bridge
```

If the printer uses a different device path:

```bash
PRINT_BRIDGE_DEVICE=/dev/usb/lp1 pnpm print-bridge
```

## Windows USB Setup

1. Install the POS-5890U-L Windows printer driver.
2. Add the printer in Windows Settings.
3. Note the exact printer name from Windows.
4. Start the bridge with that name:

```powershell
$env:PRINT_BRIDGE_PRINTER_NAME="POS-5890"
pnpm print-bridge
```

The bridge uses `print-bridge/windows-raw-print.ps1` to send raw ESC/POS bytes to the installed Windows printer queue.

If PowerShell blocks the helper script, run the bridge again; it starts PowerShell with:

```txt
-ExecutionPolicy Bypass
```

The bypass applies to that bridge-launched process only.

## Bridge Configuration

Environment variables:

| Variable | Default | Purpose |
|---|---:|---|
| `PRINT_BRIDGE_PORT` | `9321` | Local HTTP port |
| `PRINT_BRIDGE_HOST` | `127.0.0.1` | Local bind address |
| `PRINT_BRIDGE_TARGET` | `auto` | `auto`, `linux-device`, `windows-queue`, or `file` |
| `PRINT_BRIDGE_DEVICE` | `/dev/usb/lp0` | Linux USB printer device |
| `PRINT_BRIDGE_PRINTER_NAME` | empty | Windows installed printer name |
| `PRINT_BRIDGE_CUT` | `0` | Set `1` to send ESC/POS cut command |
| `PRINT_BRIDGE_ALLOWED_ORIGINS` | `*` | Comma-separated allowed web origins |
| `PRINT_BRIDGE_FILE` | `receipt-print.bin` | Output file path when target is `file` |

Example with a deployed Vercel origin:

```bash
PRINT_BRIDGE_ALLOWED_ORIGINS=https://your-app.vercel.app pnpm print-bridge
```

## Vercel Deployment

Vercel hosts only the PWA. The bridge must run locally on every machine that has a receipt printer attached.

Deployment model:

```txt
Vercel app
  -> local machine bridge
  -> local USB printer
```

No printer hardware is connected to Vercel.

## Cashier Workflow

Daily startup:

1. Connect the POS-5890U-L over USB.
2. Start the local bridge:

   ```bash
   pnpm print-bridge
   ```

3. Open the deployed PWA.
4. Borrow or return tools.
5. Click `Done`.
6. Receipt prints automatically if the bridge is reachable.

If automatic printing fails, the PWA opens browser print as fallback.

## Troubleshooting

Bridge unavailable:

```bash
curl http://localhost:9321/health
```

Port already in use:

```bash
curl http://localhost:9321/health
```

If it returns bridge status, the bridge is already running. Keep using it.

If you need to find the process:

```bash
ss -ltnp | grep 9321
```

To start a second bridge on another port:

```bash
PRINT_BRIDGE_PORT=9322 pnpm print-bridge
```

Then point the PWA to it:

```js
localStorage.setItem("receiptPrintBridgeUrl", "http://localhost:9322")
```

Linux printer missing:

```bash
lsusb
ls -l /dev/usb/lp*
sudo dmesg | grep -iE "0416|5011|usblp|printer"
```

Linux permission denied:

```bash
sudo usermod -aG lp "$USER"
```

Then log out and log back in.

Windows printer name unknown:

```powershell
Get-Printer | Select-Object Name
```

Test bridge without a printer by writing bytes to a file:

```bash
PRINT_BRIDGE_TARGET=file pnpm print-bridge
```
