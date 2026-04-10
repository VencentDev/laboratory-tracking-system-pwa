"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Barcode from "react-barcode";

import { Button } from "@/core/ui/button";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/core/ui/context-menu";

type BarcodeDisplayProps = {
  value: string;
  itemName?: string;
  showPrintButton?: boolean;
  enableContextMenu?: boolean;
  size?: "default" | "compact";
  showValue?: boolean;
  borderless?: boolean;
};

export function BarcodeDisplay({
  value,
  itemName,
  showPrintButton = true,
  enableContextMenu = true,
  size = "default",
  showValue = true,
  borderless = false,
}: BarcodeDisplayProps) {
  const isCompact = size === "compact";
  const [shouldPrint, setShouldPrint] = useState(false);

  function handlePrint() {
    setShouldPrint(true);
  }

  useEffect(() => {
    if (!shouldPrint) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      window.print();
      setShouldPrint(false);
    }, 150);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [shouldPrint]);

  const barcodeLabel = (
    <div
      className={`single-barcode-print-label overflow-x-auto bg-white text-black ${
        borderless
          ? "p-0"
          : isCompact
            ? "rounded-lg border p-2"
            : "rounded-xl border p-3"
      }`}
    >
      {itemName ? (
        <p
          className={`mb-2 text-center font-medium leading-tight text-black ${
            isCompact ? "text-[10px]" : "text-sm"
          }`}
        >
          {itemName}
        </p>
      ) : null}
      <div className="flex justify-center">
        <Barcode
          background="transparent"
          displayValue={false}
          format="CODE128"
          height={isCompact ? 22 : 36}
          value={value}
          width={isCompact ? 0.9 : 1.15}
        />
      </div>
      {showValue ? (
        <p className={`mt-2 text-center font-mono ${isCompact ? "text-[10px] tracking-[0.15em]" : "text-[11px] tracking-[0.18em]"}`}>
          {value}
        </p>
      ) : null}
    </div>
  );

  const barcodeContent = showPrintButton && enableContextMenu ? (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="cursor-context-menu">
          {barcodeLabel}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={handlePrint}>Print Label</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ) : (
    barcodeLabel
  );

  return (
    <div className={`text-center ${showPrintButton ? "space-y-3" : ""}`}>
      {barcodeContent}
      {showPrintButton ? (
        <div className="print:hidden">
          <Button type="button" onClick={handlePrint}>
            Print Label
          </Button>
        </div>
      ) : null}
      {showPrintButton ? (
        <>
          {shouldPrint && typeof document !== "undefined"
            ? createPortal(
                <div className="single-barcode-print-root">
                  {barcodeLabel}
                </div>,
                document.body,
              )
            : null}
          <style jsx global>{`
            @page {
              margin: 0;
            }

            @media print {
              body * {
                visibility: hidden;
              }

              .single-barcode-print-root,
              .single-barcode-print-root * {
                visibility: visible !important;
              }

              .single-barcode-print-root {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                right: auto !important;
                bottom: auto !important;
                transform: none !important;
                margin: 0 !important;
                padding: 12mm !important;
                width: auto !important;
                text-align: left !important;
                background: white !important;
                z-index: 9999 !important;
              }

              .single-barcode-print-label {
                display: inline-block !important;
                border: 0 !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                padding: 0 !important;
              }
            }
          `}</style>
        </>
      ) : null}
    </div>
  );
}
