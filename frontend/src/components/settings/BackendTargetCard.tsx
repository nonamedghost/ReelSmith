import React from "react";
import { Server } from "lucide-react";

interface BackendTargetCardProps {
  localBackendUrl: string;
  setLocalBackendUrl: React.Dispatch<React.SetStateAction<string>>;
  handleSaveUrl: React.ComponentProps<"form">["onSubmit"];

  urlMessage: {
    type: "success" | "error";
    text: string;
  } | null;
}

const BackendTargetCard: React.FC<BackendTargetCardProps> = ({
  localBackendUrl,
  setLocalBackendUrl,
  handleSaveUrl,
  urlMessage,
}) => {
  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
        <Server className="w-5 h-5 text-violet-400" />
        <h3 className="text-lg font-bold text-white">Client Backend Target</h3>
      </div>

      <form onSubmit={handleSaveUrl} className="space-y-4 max-w-xl">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Express Server URL</label>
          <div className="flex gap-2">
            <input
              type="url"
              required
              value={localBackendUrl}
              onChange={(e) => setLocalBackendUrl(e.target.value)}
              placeholder="http://localhost:3000"
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />

            <button
              type="submit"
              className="px-5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 hover:border-violet-500/50 transition-all"
            >
              Apply
            </button>
          </div>
        </div>

        {urlMessage && (
          <p className={`text-xs ${urlMessage.type === "success" ? "text-emerald-400" : "text-rose-400"}`}>
            {urlMessage.text}
          </p>
        )}
      </form>
    </div>
  );
};

export default BackendTargetCard;