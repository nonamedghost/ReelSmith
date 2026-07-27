export async function getReels(req, res) {
  res.json({
    success: true,
    reels: [],
  });
}

export async function getLatestReel(req, res) {
  res.json({
    success: true,
    reel: null,
  });
}

export async function deleteReel(req, res) {
  const { id } = req.params;

  res.json({
    success: true,
    deleted: id,
  });
}