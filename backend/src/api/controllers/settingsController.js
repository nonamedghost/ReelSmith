import { loadSettings, saveSettings as saveRuntimeSettings } from "../services/settingsService.js";

export async function getSettings(req, res) {
  try {
    const settings = await loadSettings();

    res.json({
      success: true,
      settings,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

export async function saveSettings(req, res) {
  try {
    const settings = await saveRuntimeSettings(req.body);

    res.json({
      success: true,
      message: "Settings saved.",
      settings,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

