import fs from "node:fs";
import path from "node:path";

export const getDefaultPermissions = (moduleName: string) => {
  const filePath = path.join(__dirname, "../config/default-permissions.json");
  const rawData = fs.readFileSync(filePath, "utf-8");
  const permissions = JSON.parse(rawData);

  return permissions[moduleName] || [];
};
