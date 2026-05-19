# Receipt Printing Workflow

## Borrow Session

1. User opens `Borrow`.
2. User selects a borrower.
3. User scans one or more tools.
4. The receipt preview updates inside the scan dialog.
5. User clicks `Done`.
6. The PWA tries the local print bridge.
7. If accepted, the bridge prints through USB.
8. If unavailable, the browser print fallback opens.

## Return Session

1. User opens `Return`.
2. User scans a borrowed tool.
3. User confirms the return in the review dialog.
4. The receipt preview updates inside the scan dialog.
5. User scans additional returned tools for the same borrower.
6. User clicks `Done`.
7. The PWA tries the local print bridge.
8. If accepted, the bridge prints through USB.
9. If unavailable, the browser print fallback opens.

## Operational Notes

- The bridge must be running on the same computer that opens the PWA.
- The printer should be connected before the bridge receives print jobs.
- Linux defaults to `/dev/usb/lp0`.
- Windows requires the installed printer queue name through `PRINT_BRIDGE_PRINTER_NAME`.
- Browser print remains as fallback so scanning work is not blocked by bridge setup issues.

