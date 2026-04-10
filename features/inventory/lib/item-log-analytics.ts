import type { ToolProfile } from "@/features/inventory/types";

export type ToolStatusSummary = {
  total: number;
  available: number;
  borrowed: number;
  missing: number;
};

const emptyToolStatusSummary: ToolStatusSummary = {
  total: 0,
  available: 0,
  borrowed: 0,
  missing: 0,
};

export function buildToolStatusSummary(tools: ToolProfile[]): ToolStatusSummary {
  return tools.reduce<ToolStatusSummary>((summary, tool) => {
    summary.total += 1;

    if (tool.currentStatus === "available") {
      summary.available += 1;
      return summary;
    }

    if (tool.currentStatus === "borrowed") {
      summary.borrowed += 1;
      return summary;
    }

    if (tool.currentStatus === "missing") {
      summary.missing += 1;
    }

    return summary;
  }, { ...emptyToolStatusSummary });
}
