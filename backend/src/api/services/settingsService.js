import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// backend/storage/settings.json
const SETTINGS_PATH = path.resolve(
  __dirname,
  "../../../storage/settings.json"
);

const DEFAULT_SETTINGS = {
  provider: "veo",
  uploadToYoutube: true,
  maxLibraryReels: 10,
};

// Creates storage/settings.json if it doesn't exist.
async function ensureSettingsFile() {
  const exists = await fs.pathExists(SETTINGS_PATH);

  if (!exists) {
    await fs.outputJson(
      SETTINGS_PATH,
      DEFAULT_SETTINGS,
      { spaces: 2 }
    );
  }
}

// Load current runtime settings.
export async function loadSettings() {
  await ensureSettingsFile();

  const settings = await fs.readJson(SETTINGS_PATH);

  return {
    ...DEFAULT_SETTINGS,
    ...settings,
  };
}

// Save runtime settings.
export async function saveSettings(settings) {
  await ensureSettingsFile();

  const merged = {
    ...DEFAULT_SETTINGS,
    ...settings,
  };

  await fs.writeJson(
    SETTINGS_PATH,
    merged,
    { spaces: 2 }
  );

  return merged;
}

// Restore default settings.
export async function resetSettings() {
  await fs.writeJson(
    SETTINGS_PATH,
    DEFAULT_SETTINGS,
    { spaces: 2 }
  );

  return DEFAULT_SETTINGS;
}