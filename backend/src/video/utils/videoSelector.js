// 🧠 GLOBAL TRACKING (DEDUPLICATION)
// Prevents same video being reused in the same session
const usedVideoIds = new Set();
const usedVideoUrls = new Set();

export function selectUniqueVideo(videos) {

 for (const video of videos) {

  const file =
   video.video_files.find(f => f.height >= 1920 && f.link) ||
   video.video_files.find(f => f.link);

   if (!file) continue;

  const url = file.link;
  // check uniqueness
  if (!usedVideoIds.has(video.id) && !usedVideoUrls.has(url)) {
   usedVideoIds.add(video.id);
   usedVideoUrls.add(url);

   return {
    video,
    file,
   };
  }
 }

 return null;
}