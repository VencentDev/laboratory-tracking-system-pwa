export type AdminSession = {
  role: "admin";
};

export type ToolkeeperSession = {
  role: "toolkeeper";
  sessionId: number;
  name: string;
  studentId: string;
  yearLevel: string;
  section: string;
};

export type AuthSession = AdminSession | ToolkeeperSession | null;
