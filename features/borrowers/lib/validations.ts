import { z } from "zod";

export const borrowerSchema = z.object({
  schoolId: z.string().min(4, "School ID must be at least 4 characters."),
  name: z.string().min(2, "Name must be at least 2 characters."),
  type: z.enum(["student", "instructor", "staff"]),
  program: z.string().optional(),
  yearLevel: z
    .string()
    .refine((value) => value === "" || (/^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 10), {
      message: "Year level must be a whole number between 1 and 10.",
    })
    .optional(),
  section: z.string().optional(),
  contactNumber: z.string().optional(),
});

export type BorrowerInput = z.infer<typeof borrowerSchema>;
