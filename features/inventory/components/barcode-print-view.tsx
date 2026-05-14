"use client";

import { useMemo, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import Barcode from "react-barcode";
import { RotateCcwIcon, PrinterIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import type { ToolProfile } from "@/features/inventory/types";

type BarcodePrintViewProps = {
  tools: ToolProfile | ToolProfile[];
};

type PaperSizeKey = "letter" | "legal" | "a4" | "a5";

type BarcodeCanvasItem = {
  id: number;
  toolName: string;
  barcode: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type DragState = {
  id: number;
  mode: "move" | "resize";
  pointerX: number;
  pointerY: number;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
};

const PAPER_SIZES: Record<PaperSizeKey, { label: string; width: number; height: number }> = {
  letter: { label: "Letter", width: 215.9, height: 279.4 },
  legal: { label: "Legal", width: 215.9, height: 355.6 },
  a4: { label: "A4", width: 210, height: 297 },
  a5: { label: "A5", width: 148, height: 210 },
};

const MIN_LABEL_WIDTH = 45;
const MIN_LABEL_HEIGHT = 24;

export function BarcodePrintView({ tools }: BarcodePrintViewProps) {
  const labels = useMemo(() => (Array.isArray(tools) ? tools : [tools]), [tools]);
  const [paperSizeKey, setPaperSizeKey] = useState<PaperSizeKey>("letter");
  const paperSize = PAPER_SIZES[paperSizeKey];
  const [items, setItems] = useState(() => createInitialItems(labels, PAPER_SIZES.letter));
  const [selectedItemId, setSelectedItemId] = useState<number | null>(items[0]?.id ?? null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const selectedItem = items.find((item) => item.id === selectedItemId) ?? null;

  function resetLayout(nextPaperSizeKey = paperSizeKey) {
    const nextPaperSize = PAPER_SIZES[nextPaperSizeKey];
    const nextItems = createInitialItems(labels, nextPaperSize);
    setItems(nextItems);
    setSelectedItemId(nextItems[0]?.id ?? null);
  }

  function updatePaperSize(nextPaperSizeKey: PaperSizeKey) {
    setPaperSizeKey(nextPaperSizeKey);
    resetLayout(nextPaperSizeKey);
  }

  function getPointerDeltaInMillimeters(event: PointerEvent<HTMLDivElement>, dragState: DragState) {
    const canvasBounds = canvasRef.current?.getBoundingClientRect();

    if (!canvasBounds) {
      return { deltaX: 0, deltaY: 0 };
    }

    return {
      deltaX: (event.clientX - dragState.pointerX) * (paperSize.width / canvasBounds.width),
      deltaY: (event.clientY - dragState.pointerY) * (paperSize.height / canvasBounds.height),
    };
  }

  function handlePointerDown(
    event: PointerEvent<HTMLDivElement>,
    item: BarcodeCanvasItem,
    mode: DragState["mode"],
  ) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedItemId(item.id);
    dragStateRef.current = {
      id: item.id,
      mode,
      pointerX: event.clientX,
      pointerY: event.clientY,
      startX: item.x,
      startY: item.y,
      startWidth: item.width,
      startHeight: item.height,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const dragState = dragStateRef.current;

    if (!dragState) {
      return;
    }

    const { deltaX, deltaY } = getPointerDeltaInMillimeters(event, dragState);

    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== dragState.id) {
          return item;
        }

        if (dragState.mode === "resize") {
          const nextWidth = clamp(dragState.startWidth + deltaX, MIN_LABEL_WIDTH, paperSize.width - item.x);
          const nextHeight = clamp(dragState.startHeight + deltaY, MIN_LABEL_HEIGHT, paperSize.height - item.y);

          return {
            ...item,
            width: nextWidth,
            height: nextHeight,
          };
        }

        return {
          ...item,
          x: clamp(dragState.startX + deltaX, 0, paperSize.width - item.width),
          y: clamp(dragState.startY + deltaY, 0, paperSize.height - item.height),
        };
      }),
    );
  }

  function handlePointerUp() {
    dragStateRef.current = null;
  }

  function updateSelectedItem(field: "x" | "y" | "width" | "height", value: number) {
    if (!selectedItem) {
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== selectedItem.id) {
          return item;
        }

        const nextItem = {
          ...item,
          [field]: value,
        };

        return clampCanvasItem(nextItem, paperSize);
      }),
    );
  }

  return (
    <>
      <div className="batch-barcode-editor-root space-y-5">
        <div className="batch-barcode-editor-toolbar flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Barcode Print Canvas</h2>
            <p className="text-sm text-muted-foreground">
              Move and resize selected barcode labels before printing.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" className="justify-between rounded-xl sm:min-w-36">
                  {paperSize.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup
                  value={paperSizeKey}
                  onValueChange={(value) => updatePaperSize(value as PaperSizeKey)}
                >
                  {Object.entries(PAPER_SIZES).map(([key, size]) => (
                    <DropdownMenuRadioItem key={key} value={key}>
                      {size.label} ({Math.round(size.width)} x {Math.round(size.height)} mm)
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button type="button" variant="outline" onClick={() => resetLayout()}>
              <RotateCcwIcon />
              Reset
            </Button>
            <Button type="button" disabled={items.length === 0} onClick={() => window.print()}>
              <PrinterIcon />
              Print
            </Button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
          <div className="overflow-auto rounded-[calc(var(--radius-xl)+2px)] border border-border/70 bg-muted/30 p-4">
            <div
              ref={canvasRef}
              className="barcode-print-paper relative mx-auto overflow-hidden bg-white text-black shadow-soft"
              style={{
                width: `${paperSize.width}mm`,
                height: `${paperSize.height}mm`,
              }}
            >
              {items.map((item) => {
                const isSelected = selectedItemId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`barcode-print-item absolute select-none bg-white ${
                      isSelected ? "ring-2 ring-primary" : "ring-1 ring-black/10"
                    }`}
                    style={{
                      left: `${item.x}mm`,
                      top: `${item.y}mm`,
                      width: `${item.width}mm`,
                      height: `${item.height}mm`,
                    }}
                    onPointerDown={(event) => handlePointerDown(event, item, "move")}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                  >
                    <BarcodeLabel item={item} />
                    <div
                      className="barcode-resize-handle absolute bottom-0 right-0 size-4 cursor-nwse-resize rounded-tl-md bg-primary print:hidden"
                      onPointerDown={(event) => {
                        event.stopPropagation();
                        handlePointerDown(event, item, "resize");
                      }}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      aria-hidden="true"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="batch-barcode-editor-controls space-y-4 rounded-[calc(var(--radius-xl)+2px)] border border-border/70 bg-card/80 p-4 shadow-soft">
            <div>
              <h3 className="text-sm font-semibold tracking-tight">Selected Label</h3>
              <p className="text-xs text-muted-foreground">
                Drag on the canvas or enter exact measurements in millimeters.
              </p>
            </div>

            {selectedItem ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
                  <div className="truncate text-sm font-medium">{selectedItem.toolName}</div>
                  <div className="truncate font-mono text-xs text-muted-foreground">{selectedItem.barcode}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MeasurementInput label="X" value={selectedItem.x} onChange={(value) => updateSelectedItem("x", value)} />
                  <MeasurementInput label="Y" value={selectedItem.y} onChange={(value) => updateSelectedItem("y", value)} />
                  <MeasurementInput
                    label="Width"
                    value={selectedItem.width}
                    onChange={(value) => updateSelectedItem("width", value)}
                  />
                  <MeasurementInput
                    label="Height"
                    value={selectedItem.height}
                    onChange={(value) => updateSelectedItem("height", value)}
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/80 p-4 text-sm text-muted-foreground">
                Select a barcode label on the canvas.
              </div>
            )}
          </div>
        </div>
      </div>

      {typeof document !== "undefined"
        ? createPortal(
            <div className="barcode-print-output" aria-hidden="true">
              <div
                className="barcode-print-output-paper"
                style={{
                  width: `${paperSize.width}mm`,
                  height: `${paperSize.height}mm`,
                }}
              >
                {items.map((item) => (
                  <div
                    key={`print-${item.id}`}
                    className="barcode-print-output-item"
                    style={{
                      left: `${item.x}mm`,
                      top: `${item.y}mm`,
                      width: `${item.width}mm`,
                      height: `${item.height}mm`,
                    }}
                  >
                    <BarcodeLabel item={item} />
                  </div>
                ))}
              </div>
            </div>,
            document.body,
          )
        : null}

      <style jsx global>{`
        .barcode-print-item {
          cursor: move;
          touch-action: none;
        }

        .barcode-print-output {
          display: block;
          height: 0;
          left: -10000px;
          overflow: hidden;
          position: fixed;
          top: 0;
          width: 0;
        }

        @page {
          size: ${paperSize.width}mm ${paperSize.height}mm;
          margin: 0;
        }

        @media print {
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body > :not(.barcode-print-output) {
            display: none !important;
          }

          .barcode-print-output {
            display: block !important;
            position: fixed !important;
            inset: 0 auto auto 0 !important;
            width: ${paperSize.width}mm !important;
            height: ${paperSize.height}mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            z-index: 9999 !important;
          }

          .barcode-print-output-paper {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: ${paperSize.width}mm !important;
            height: ${paperSize.height}mm !important;
            background: white !important;
            box-shadow: none !important;
            overflow: hidden !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .barcode-print-output-item {
            background: white !important;
            box-shadow: none !important;
            outline: none !important;
            border: 0 !important;
            color: black !important;
            position: absolute !important;
          }
        }
      `}</style>
    </>
  );
}

function BarcodeLabel({ item }: { item: BarcodeCanvasItem }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden p-2 text-center text-black">
      <div className="max-w-full truncate text-[10px] font-semibold leading-tight">{item.toolName}</div>
      <div className="flex max-w-full justify-center overflow-hidden">
        <Barcode
          background="transparent"
          displayValue={false}
          format="CODE128"
          height={Math.max(16, item.height * 0.42)}
          value={item.barcode}
          width={Math.max(0.7, Math.min(1.4, item.width / 70))}
        />
      </div>
      <div className="max-w-full truncate font-mono text-[9px] tracking-[0.16em]">{item.barcode}</div>
    </div>
  );
}

function MeasurementInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type="number"
        min={0}
        step={1}
        value={Math.round(value * 10) / 10}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

function createInitialItems(labels: ToolProfile[], paperSize: { width: number; height: number }) {
  const margin = 12;
  const gap = 6;
  const labelWidth = 58;
  const labelHeight = 32;
  const columns = Math.max(1, Math.floor((paperSize.width - margin * 2 + gap) / (labelWidth + gap)));

  return labels.map((tool, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);

    return clampCanvasItem(
      {
        id: tool.id,
        toolName: tool.name || "Unnamed tool",
        barcode: tool.barcode,
        x: margin + column * (labelWidth + gap),
        y: margin + row * (labelHeight + gap),
        width: labelWidth,
        height: labelHeight,
      },
      paperSize,
    );
  });
}

function clampCanvasItem(item: BarcodeCanvasItem, paperSize: { width: number; height: number }) {
  const width = clamp(item.width, MIN_LABEL_WIDTH, paperSize.width);
  const height = clamp(item.height, MIN_LABEL_HEIGHT, paperSize.height);

  return {
    ...item,
    width,
    height,
    x: clamp(item.x, 0, paperSize.width - width),
    y: clamp(item.y, 0, paperSize.height - height),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
