import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const publicRoutesDirectory = path.join(process.cwd(), "app", "(public)");
const blockedCopy = [/coming soon/i, /\[coffee shop name\]/i, /support@coffeeshop\.com/i, /\[physical store\/business address/i, /\[your country\/state\/region\]/i];

async function getFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? getFiles(entryPath) : [entryPath];
  }));
  return nestedFiles.flat().filter((file) => file.endsWith(".tsx"));
}

async function main() {
  const violations: string[] = [];
  for (const file of await getFiles(publicRoutesDirectory)) {
    const content = await readFile(file, "utf8");
    for (const pattern of blockedCopy) if (pattern.test(content)) violations.push(`${path.relative(process.cwd(), file)} matches ${pattern}`);
  }
  if (violations.length > 0) {
    console.error("Public content check failed:\n" + violations.map((violation) => `- ${violation}`).join("\n"));
    process.exitCode = 1;
    return;
  }
  console.log("Public content check passed.");
}

void main();
