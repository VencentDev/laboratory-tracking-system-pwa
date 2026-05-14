import { appDb } from "@/core/db/app-db";
import type { ToolkeeperSessionRecord } from "@/core/db/schema";

export type ToolkeeperSessionInput = {
  name: string;
  studentId: string;
  yearLevel: string;
  section: string;
};

async function seedDefaultAdminCredentials() {
  await appDb.adminCredentials.put({
    id: "admin",
    username: "admin",
    passwordHash: await hashPassword("admin123"),
    updatedAt: new Date(),
  });
}

export async function hashPassword(password: string): Promise<string> {
  const encodedPassword = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedPassword);

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function getAdminCredentials() {
  const credentials = await appDb.adminCredentials.get("admin");

  if (credentials) {
    return credentials;
  }

  await seedDefaultAdminCredentials();
  return appDb.adminCredentials.get("admin");
}

export async function verifyAdminLogin(username: string, password: string) {
  const credentials = await getAdminCredentials();

  if (!credentials) {
    return false;
  }

  return credentials.username === username && credentials.passwordHash === await hashPassword(password);
}

export async function updateAdminCredentials(username: string, password: string) {
  await appDb.adminCredentials.put({
    id: "admin",
    username,
    passwordHash: await hashPassword(password),
    updatedAt: new Date(),
  });
}

export async function createToolkeeperSession(data: ToolkeeperSessionInput) {
  return appDb.toolkeeperSessions.add({
    ...data,
    loginAt: new Date(),
    logoutAt: null,
  } as ToolkeeperSessionRecord);
}

export async function closeToolkeeperSession(sessionId: number) {
  await appDb.toolkeeperSessions.update(sessionId, {
    logoutAt: new Date(),
  });
}

export async function listToolkeeperSessions() {
  return appDb.toolkeeperSessions.orderBy("loginAt").reverse().toArray();
}

export async function getSessionTransactions(loginAt: Date, logoutAt: Date | null) {
  let collection = appDb.transactions.where("recordedAt").aboveOrEqual(loginAt);

  if (logoutAt) {
    collection = collection.and((transaction) => transaction.recordedAt <= logoutAt);
  }

  return collection.reverse().sortBy("recordedAt");
}

export async function getSessionWithTransactions(sessionId: number) {
  const session = await appDb.toolkeeperSessions.get(sessionId);

  if (!session) {
    return null;
  }

  return {
    session,
    transactions: await getSessionTransactions(session.loginAt, session.logoutAt),
  };
}
