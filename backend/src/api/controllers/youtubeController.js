export async function getYoutubeStatus(req, res) {
  res.json({
    success: true,
    youtube: {
      connected: false,
      channelName: null,
      avatarUrl: null,
    },
  });
}

export async function getYoutubeAuthUrl(req, res) {
  res.json({
    success: true,
    url: null,
  });
}

export async function disconnectYoutube(req, res) {
  res.json({
    success: true,
    message: "YouTube disconnected.",
  });
}