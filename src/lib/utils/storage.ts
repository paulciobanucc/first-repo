import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const repoPath = (...parts: string[]) => path.join(process.cwd(), ...parts);

export const ensureDir = async (dirPath: string) => {
  await mkdir(dirPath, { recursive: true });
};

export const readJsonFile = async <T>(filePath: string, fallback: T) => {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const writeJsonFile = async (filePath: string, value: unknown) => {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};

export const writeTextFile = async (filePath: string, value: string) => {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, value, "utf8");
};

