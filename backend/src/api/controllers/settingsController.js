export async function getSettings(req, res) {
  res.json({
    success: true,
    settings: {},
  });
}

export async function saveSettings(req, res) {
  res.json({
    success: true,
    message: "Settings saved.",
  });
}