export type ToolStatus = "available" | "borrowed" | "missing";

export type ToolProfile = {
  id: number;
  barcode: string;
  name: string;
  description: string | null;
  category: string | null;
  currentStatus: ToolStatus;
  createdAt: Date;
  updatedAt: Date;
};
