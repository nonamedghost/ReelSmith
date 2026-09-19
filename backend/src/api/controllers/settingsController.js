
import UserSettings from "../../database/UserSettings.js";

const DEFAULT_SETTINGS = {
  provider: "veo",
  uploadToYoutube: true,
  maxLibraryReels: 10,
};

export async function getSettings(req, res) {
  try {
    const userId = req.user.userId;

    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: {
          userId,
          ...DEFAULT_SETTINGS,
        },
      },
      {
        returnDocument: "after",
        upsert: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    res.json({
      success: true,
      settings: {
        provider: settings.provider,
        uploadToYoutube: settings.uploadToYoutube,
        maxLibraryReels: settings.maxLibraryReels,
      },
    });
  } catch (err) {
    console.error("Failed to load user settings:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

export async function saveSettings(req, res) {
  try {
    const userId = req.user.userId;

    const { provider, uploadToYoutube, maxLibraryReels } = req.body;

    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      {
        $set: {
          provider,
          uploadToYoutube,
          maxLibraryReels,
        },
        $setOnInsert: {
          userId,
        },
      },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
      }
    ).lean();

    res.json({
      success: true,
      message: "Settings saved.",
      settings: {
        provider: settings.provider,
        uploadToYoutube: settings.uploadToYoutube,
        maxLibraryReels: settings.maxLibraryReels,
      },
    });
  } catch (err) {
    console.error("Failed to save user settings:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}