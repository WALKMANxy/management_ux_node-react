//src/utils/fileUtils.ts
import fs from "fs";
import path from "path";

export const readFile = (filePath: string): string => {
  return fs.readFileSync(filePath, "utf-8");
};

export const writeFile = (filePath: string, data: any): void => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

export const resolveFilePath = (relativePath: string): string => {
  return path.resolve(relativePath);
};
