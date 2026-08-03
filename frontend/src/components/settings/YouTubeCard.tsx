import React from "react";
import { Video, Loader2 } from "lucide-react";
import type { YoutubeStatus, AppSettings } from "../../api/settings";

interface YouTubeCardProps {
  ytStatus: YoutubeStatus;
  ytLoading: boolean;
  appSettings: AppSettings;
  handleConnectYoutube: () => void;
  handleDisconnectYoutube: () => void;
}

const YouTubeCard: React.FC<YouTubeCardProps> = ({
  ytStatus,
  ytLoading,
  appSettings,
  handleConnectYoutube,
  handleDisconnectYoutube,
}) => {
  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">

      <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
        <Video className="w-5 h-5 text-rose-500" />
        <h3 className="text-lg font-bold text-white">YouTube Channel</h3>
      </div>

      {ytStatus.isConnected ? (
        // Linked account card layout
        <div className="space-y-6 text-center">
          <div className="relative inline-block">
            {ytStatus.avatarUrl ? (
              <img src={ytStatus.avatarUrl} alt="Channel Avatar"
                className="w-20 h-20 rounded-full border-2 border-rose-500/80 shadow-xl"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center border-2 border-rose-500/35 mx-auto">
                <Video className="w-8 h-8" />
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 text-white border-2 border-slate-900 rounded-full flex items-center justify-center text-[10px] font-bold">
              ✓
            </span>
          </div>

          <div>
            <h4 className="font-bold text-white">{ytStatus.channelName || "YouTube Account"}</h4>
            <p className="text-[10px] text-slate-500 mt-1">Authorized & Linked</p>
          </div>

          <button onClick={handleDisconnectYoutube} disabled={ytLoading}
            className="w-full py-2.5 rounded-xl border border-rose-900/25 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            {ytLoading && (<Loader2 className="w-3.5 h-3.5 animate-spin" />)}Disconnect Account
          </button>
        </div>

      ) : (

        <div className="space-y-4 text-center py-4">
          <div className="w-16 h-16 rounded-full bg-slate-950 text-slate-600 flex items-center justify-center mx-auto border border-slate-850">
            <Video className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-white text-sm">No Channel Linked</h4>
            <p className="text-[10px] text-slate-500 leading-normal px-4">
              Authenticate to link your YouTube channel and publish generated reels as shorts.
            </p>
          </div>

          <button
            onClick={handleConnectYoutube}
            disabled={ytLoading || !appSettings.uploadToYoutube}
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all shadow-lg shadow-rose-600/10 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {ytLoading ? (<Loader2 className="w-3.5 h-3.5 animate-spin" />) : (<Video className="w-4 h-4" />)}
            Link YouTube Channel
          </button>

          {!appSettings.uploadToYoutube && (
            <p className="text-[9px] text-rose-400/90 leading-tight">
              Enable "Upload to YouTube" in Application Settings first.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default YouTubeCard;