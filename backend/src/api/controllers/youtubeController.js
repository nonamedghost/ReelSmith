export async function getYoutubeStatus(req, res) {
  res.json({
    success: true,
    isConnected: false,
    channelName: "",
    avatarUrl: "",
  });
}

export async function getYoutubeAuthUrl(req, res) {
  res.json({
    success: true,
    url: "",
  });
}

export async function disconnectYoutube(req, res) {
  res.json({
    success: true,
    message: "YouTube disconnected.",
  });
}