export async function getSettings(req, res) {
  res.json({
    success: true,
    settings: {
      provider: process.env.DEFAULT_PROVIDER || "veo",
      uploadToYoutube: (process.env.DEFAULT_UPLOAD ?? "true") === "true",
      maxLibraryReels: Number(process.env.MAX_LIBRARY_REELS) || 10,
    },
  });
}

export async function saveSettings(req, res) {
  const {
    provider,
    uploadToYoutube,
    maxLibraryReels,
  } = req.body;

  res.json({
    success: true,
    message: "Settings saved.",
    settings: {
      provider,
      uploadToYoutube,
      maxLibraryReels,
    },
  });
}