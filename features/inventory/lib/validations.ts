import { z } from "zod";

export const toolSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
  category: z.string().optional(),
  currentStatus: z.enum(["available", "borrowed", "missing"]),
});

export type ToolInput = z.infer<typeof toolSchema>;
