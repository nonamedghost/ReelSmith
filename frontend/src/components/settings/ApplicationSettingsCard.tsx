import React from "react";
import { Server, Save, Loader2, CheckCircle, XCircle } from "lucide-react";

import type { AppSettings } from "../../api/settings";

interface ApplicationSettingsCardProps {
  appSettings: AppSettings;

  setAppSettings: React.Dispatch<
    React.SetStateAction<AppSettings>
  >;

  message: {
    type: "success" | "error";
    text: string;
  } | null;

  saveLoading: boolean;

  handleSaveSettings: (
    e: React.FormEvent<HTMLFormElement>
  ) => Promise<void>;
}

const ApplicationSettingsCard: React.FC<
  ApplicationSettingsCardProps
> = ({
  appSettings,
  setAppSettings,
  message,
  saveLoading,
  handleSaveSettings,
}) => {
    return (
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">

        <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
          <Server className="w-5 h-5 text-violet-400" />
          <h3 className="text-lg font-bold text-white"> Application Settings </h3>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center gap-2 ${message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
              }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}

            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-8">

          <div className="space-y-3">

            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Visual Provider
            </label>

            <div className="grid grid-cols-3 gap-3">

              {[
                { value: "veo", label: "Veo" },
                { value: "pexels", label: "Pexels" },
                { value: "hybrid", label: "Hybrid" },
              ].map((provider) => (

                <button
                  key={provider.value}
                  type="button"
                  onClick={() =>
                    setAppSettings(prev => ({
                      ...prev,
                      provider:
                        provider.value as AppSettings["provider"],
                    }))
                  }
                  className={`rounded-xl border p-4 transition-all
                ${appSettings.provider === provider.value
                      ? "border-violet-500 bg-violet-500/10 text-white"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                    }`}
                >
                  {provider.label}
                </button>

              ))}

            </div>

          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4">

            <div>

              <h4 className="text-white font-medium">
                Upload finished reels to YouTube
              </h4>

              <p className="text-xs text-slate-500 mt-1">
                Automatically publish reels after generation.
              </p>

            </div>

            <input
              type="checkbox"
              checked={appSettings.uploadToYoutube}
              onChange={(e) =>
                setAppSettings(prev => ({
                  ...prev,
                  uploadToYoutube: e.target.checked,
                }))
              }
              className="w-5 h-5 accent-violet-500"
            />

          </div>

          <div className="space-y-3">

            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Maximum Library Size
            </label>

            <input
              type="number"
              min={1}
              max={1000}
              value={appSettings.maxLibraryReels}
              onChange={(e) =>
                setAppSettings(prev => ({
                  ...prev,
                  maxLibraryReels: Number(e.target.value),
                }))
              }
              className="w-32 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />

            <p className="text-xs text-slate-500">
              Older generations will be cleaned up automatically once this limit is reached.
            </p>

          </div>

          <button
            type="submit"
            disabled={saveLoading}
            className="py-3 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-violet-500/10 disabled:opacity-50"
          >
            {saveLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}

            Save Settings

          </button>

        </form>

      </div>
    );
  };

export default ApplicationSettingsCard;