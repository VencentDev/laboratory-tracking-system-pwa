export type BorrowerProfile = {
  id: string;
  schoolId: string;
  name: string;
  image: string | null;
  type: "student" | "instructor" | "staff";
  program: string | null;
  yearLevel: number | null;
  section: string | null;
  contactNumber: string | null;
  createdAt: Date;
};
