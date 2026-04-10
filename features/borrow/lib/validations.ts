import { z } from "zod";

export const scanInputSchema = z.object({
  barcode: z.string().min(1),
  mode: z.enum(["borrow", "return"]),
  borrowerId: z.string().optional(),
});

export const returnPreviewInputSchema = scanInputSchema.pick({
  barcode: true,
});

export type ScanInput = z.infer<typeof scanInputSchema>;
