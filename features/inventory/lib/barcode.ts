const TOOL_BARCODE_PREFIX = "TOOL-";
const TOOL_BARCODE_PADDING = 4;

export function formatToolBarcode(toolId: number) {
  return `${TOOL_BARCODE_PREFIX}${String(toolId).padStart(TOOL_BARCODE_PADDING, "0")}`;
}

export function getNextToolBarcodePreview(tools: Array<{ id: number }> | undefined) {
  const highestToolId = tools?.reduce((highestId, tool) => Math.max(highestId, tool.id), 0) ?? 0;

  return formatToolBarcode(highestToolId + 1);
}
