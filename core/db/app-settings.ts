import { appDb } from "@/core/db/app-db";

export async function getAppSetting(key: string) {
  return (await appDb.appSettings.get(key)) ?? null;
}

export async function setAppSetting(key: string, value: string) {
  const setting = {
    key,
    value,
    updatedAt: new Date(),
  };

  await appDb.appSettings.put(setting);

  return setting;
}

export async function listAppSettings() {
  return appDb.appSettings.orderBy("updatedAt").reverse().toArray();
}

