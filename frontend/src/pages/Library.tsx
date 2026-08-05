import React, { useEffect, useState } from 'react';
import {
  Play,
  Download,
  Trash2,
  //Youtube,
  Video,
  ExternalLink,
  Loader2,
  AlertCircle,
  Clock,
  Film,
  X
} from 'lucide-react';
import { getReels, deleteReel,/* Reel */ } from '../api/reels';
import type { Reel } from "../api/reels";
import { useSettings } from '../context/SettingsContext';

export const Library: React.FC = () => {
  const { backendUrl, isApiOnline } = useSettings();
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal tracking
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeReel, setActiveReel] = useState<Reel | null>(null);

  const fetchReelsList = async () => {
    if (!isApiOnline) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getReels();
      setReels(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to retrieve library', err);
      setError('Could not fetch the generated reels archive.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReelsList();
  }, [isApiOnline]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this generated Reel? This will remove all local files for this job.')) {
      return;
    }
    try {
      await deleteReel(id);
      setReels((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      console.error('Failed to delete reel', err);
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const openPreviewModal = (reel: Reel) => {
    // Backend path is usually like "output/final/video.mp4" but we can serve specific files
    // Let's resolve the path relative to the backendUrl
    const url = `${backendUrl}/api/reels/video/${reel.id}?t=${Date.now()}`;
    setActiveVideoUrl(url);
    setActiveReel(reel);
  };

  const closePreviewModal = () => {
    setActiveVideoUrl(null);
    setActiveReel(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50svh] space-y-4">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        <p className="text-slate-400 text-sm">Loading video archive...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Video Library</h1>
          <p className="text-slate-400 text-sm mt-1">Preview, download, and manage your generated Reels assets.</p>
        </div>
        <button
          onClick={fetchReelsList}
          disabled={!isApiOnline}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          Refresh Library
        </button>
      </div>

      {/* Offline Status */}
      {!isApiOnline && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>The API backend is offline. Connect the backend to view generated items.</span>
        </div>
      )}

      {/* Error Boundary */}
      {error && isApiOnline && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {isApiOnline && reels.length === 0 && !error && (
        <div className="py-20 text-center space-y-4 max-w-sm mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-center text-slate-500 mx-auto">
            <Film className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">No video reels found</h3>
            <p className="text-slate-500 text-sm mt-1 leading-relaxed">
              Generate a reel to add it to your library archive. All generated outputs will appear here.
            </p>
          </div>
        </div>
      )}

      {/* Card Grid */}
      {isApiOnline && reels.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {reels.map((reel) => {
            // Check status indicators
            const isUploaded = reel.youtubeUploadStatus === 'success';

            return (
              <div
                key={reel.id}
                className="group bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800/80 overflow-hidden shadow-lg hover:border-slate-700/60 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between"
              >
                {/* Visual Thumbnail Placeholder */}
                <div className="aspect-[9/16] bg-slate-950 relative flex items-center justify-center overflow-hidden border-b border-slate-800/60 h-64">
                  <img
                    src={`${backendUrl}/api/reels/thumbnail/${reel.id}`}
                    alt={reel.metadata?.title || reel.topic}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  {/* Floating Action Icons */}
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-300">
                    <button
                      onClick={() => openPreviewModal(reel)}
                      className="w-11 h-11 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                      title="Play Preview"
                    >
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </button>
                    <a
                      href={`${backendUrl}/api/reels/download/${reel.id}`}
                      download={`reel_${reel.id}.mp4`}
                      className="w-11 h-11 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center justify-center border border-slate-750 shadow-lg transition-transform hover:scale-105"
                      title="Download Video"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>

                  {/* Floating YouTube status */}
                  {isUploaded && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 flex items-center gap-1.5 backdrop-blur-sm">
                      <Video className="w-3.5 h-3.5 text-rose-500" />
                      <span>Uploaded</span>
                    </div>
                  )}
                </div>

                {/* Metadata Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(reel.createdAt).toLocaleDateString()}
                    </h4>
                    <h3 className="text-sm font-bold text-white truncate" title={reel.metadata?.title || reel.topic}>
                      {reel.metadata?.title || reel.topic}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-750">
                      {reel.provider === "veo"
                        ? "Veo 3"
                        : reel.provider === "pexels"
                          ? "Pexels"
                          : reel.provider}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-750 max-w-[120px] truncate">
                      {reel.voice
                        ? `Aura 2 · ${reel.voice
                          .replace("aura-2-", "")
                          .replace("-en", "")
                          .replace(/^./, c => c.toUpperCase())
                        }`
                        : "Unknown"}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-750">
                      {reel.duration.toFixed(1)}s
                    </span>
                  </div>

                  {/* Danger zone delete button */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    {reel.youtubeVideoId ? (
                      <a
                        href={`https://youtube.com/watch?v=${reel.youtubeVideoId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
                      >
                        YouTube Link
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-500">Local reel</span>
                    )}

                    <button
                      onClick={() => handleDelete(reel.id)}
                      className="p-1.5 rounded-lg bg-slate-950 hover:bg-rose-950/30 text-slate-600 hover:text-rose-400 border border-slate-850 hover:border-rose-900/30 transition-all"
                      title="Delete Reel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIGHTBOX / MODAL PLAYER */}
      {activeVideoUrl && activeReel && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 md:p-6 backdrop-blur-sm animate-fade-in">

          {/* Close button outside modal panel */}
          <button
            onClick={closePreviewModal}
            className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full bg-slate-900/80 text-slate-400 hover:text-white border border-slate-850"
            aria-label="Close Preview"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Modal Content Grid */}
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col md:flex-row relative"
            onClick={(e) => e.stopPropagation()} // Stop bubbling closes
          >
            {/* Left Column: Player */}
            <div className="md:w-[40%] bg-black flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-800 min-h-[300px]">
              <div className="w-48 aspect-[9/16] rounded-2xl overflow-hidden border border-slate-850 shadow-2xl bg-black relative">
                <video
                  src={activeVideoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right Column: Metadata details */}
            <div className="md:w-[60%] p-6 flex flex-col justify-between overflow-y-auto space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Video Title</h4>
                  <h3 className="text-lg font-bold text-white mt-1">
                    {activeReel.metadata?.title || activeReel.topic}
                  </h3>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Generated Script</h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-h-48 overflow-y-auto custom-scrollbar whitespace-pre-line bg-slate-950 p-3.5 rounded-2xl border border-slate-850">
                    {activeReel.script}
                  </p>
                </div>

                {activeReel.metadata && (
                  <>
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</h4>
                      <p className="text-[11px] text-slate-500 mt-1 whitespace-pre-line max-h-24 overflow-y-auto custom-scrollbar">
                        {activeReel.metadata.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tags</h4>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {activeReel.metadata.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-750"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Bottom control links */}
              <div className="pt-4 border-t border-slate-850 flex items-center justify-between">
                <a
                  href={`${backendUrl}/api/reels/download/${activeReel.id}`}
                  download={`reel_${activeReel.id}.mp4`}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
                >
                  <Download className="w-4 h-4" />
                  Download File
                </a>

                {activeReel.youtubeVideoId && (
                  <a
                    href={`https://youtube.com/watch?v=${activeReel.youtubeVideoId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-750 text-xs font-semibold flex items-center gap-2 transition-colors"
                  >
                    <Video className="w-4 h-4 text-rose-500" />
                    Open YouTube
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Library;
