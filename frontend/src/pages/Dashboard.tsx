import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Film,
  Settings as SettingsIcon,
  PlusCircle,
  CheckCircle,
  Video,
  Loader2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { getReels, type Reel } from '../api/reels';
import { useSettings } from '../context/SettingsContext';

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" {...props}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.003 3.003 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107c1.883.511 9.388.511 9.388.511s7.505 0 9.388-.511a3.003 3.003 0 0 0 2.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export const Dashboard: React.FC = () => {
  const { isApiOnline } = useSettings();
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
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
        console.error('Failed to fetch reels for dashboard', err);
        setError('Failed to fetch dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isApiOnline]);

  // Derived statistics
  const totalReels = reels.length;
  const youtubeUploads = reels.filter((r) => r.youtubeUploadStatus === 'success').length;
  const veoCount = reels.filter((r) => r.provider === 'veo').length;
  const pexelsCount = reels.filter((r) => r.provider === 'pexels').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50svh] space-y-4">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        <p className="text-slate-400 text-sm">Loading dashboard statistics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-left">

      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden p-6 md:p-8 bg-gradient-to-r from-violet-900/40 via-indigo-950/30 to-slate-900 border border-violet-800/20 shadow-xl">
        <div className="relative z-10 max-w-xl space-y-3">
          <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs font-bold uppercase tracking-wider">AI REEL STUDIO</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Turn ideas into engaging Reels with AI</h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Generate narration scripts, create AI voiceovers, generate captions, source visuals, render vertical videos, and publish directly to YouTube.
          </p>
          <div className="pt-2">
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-500/10 active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              Create A New Reel
            </Link>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-gradient from-violet-600/15 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Metrics Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Metric 1: Total Reels */}
        <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center flex-shrink-0">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Reels</p>
            <p className="text-2xl font-black text-white mt-1">{totalReels}</p>
          </div>
        </div>

        {/* Metric 2: YouTube Uploads */}
        <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
            <YoutubeIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">YouTube Uploaded</p>
            <p className="text-2xl font-black text-white mt-1">{youtubeUploads}</p>
          </div>
        </div>

        {/* Metric 3: Veo Provider */}
        <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Veo Visuals</p>
            <p className="text-2xl font-black text-white mt-1">{veoCount}</p>
          </div>
        </div>

        {/* Metric 4: Pexels Provider */}
        <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Visuals</p>
            <p className="text-2xl font-black text-white mt-1">{pexelsCount}</p>
          </div>
        </div>

      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Recent Generation List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Recent Generations</h3>
              <Link to="/library" className="text-xs text-violet-400 hover:text-violet-300 font-semibold">View All Library</Link>
            </div>

            {!isApiOnline ? (
              <div className="py-8 text-center text-slate-500 italic">
                Connect backend server to view recent generations.
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            ) : reels.length === 0 ? (
              <div className="py-8 text-center text-slate-500 italic space-y-3">
                <p>No video reels have been generated yet.</p>
                <Link to="/create" className="inline-block text-xs px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700">Generate First Reel</Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60 overflow-hidden">
                {reels.slice(0, 5).map((reel) => (
                  <div key={reel.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-sm font-semibold text-slate-200 truncate">{reel.metadata?.title || reel.topic}</p>
                      <div className="flex items-center gap-3 text-slate-500 text-xs flex-wrap">
                        <span className="bg-slate-800/80 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-slate-400">{reel.provider}</span>
                        <span>•</span>
                        <span>{new Date(reel.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex items-center gap-2.5">
                      {reel.youtubeUploadStatus === 'success' ? (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" />
                          <span>Uploaded</span>
                        </div>
                      ) : (
                        <div className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-semibold border border-slate-700/30">
                          <span>Local Only</span>
                        </div>
                      )}
                      <Link
                        to="/library"
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/55 transition-colors"
                      >
                        Preview
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: API Keys Checklist */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <SettingsIcon className="w-4 h-4 text-slate-400" />
                Quick Actions
              </h3>
            </div>

            <div className="space-y-3">
              <Link
                to="/create"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-violet-500/50 transition-colors group"
              >
                <div className="text-left">
                  <p className="text-xs font-bold text-white">Interactive Console</p>
                  <p className="text-[10px] text-slate-500">Run manual video generation pipelines</p>
                </div>
                <PlusCircle className="w-5 h-5 text-slate-500 group-hover:text-violet-400 transition-colors" />
              </Link>

              <Link
                to="/settings"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-violet-500/50 transition-colors group"
              >
                <div className="text-left">
                  <p className="text-xs font-bold text-white">System Config</p>
                  <p className="text-[10px] text-slate-500">Update keys and setup Youtube accounts</p>
                </div>
                <SettingsIcon className="w-5 h-5 text-slate-500 group-hover:text-violet-400 transition-colors" />
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
