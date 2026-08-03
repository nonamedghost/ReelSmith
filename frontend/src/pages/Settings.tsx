import React from "react";
import { Loader2, AlertCircle } from "lucide-react";

import {
  BackendTargetCard,
  ApplicationSettingsCard,
  YouTubeCard,
} from "../components/settings";

import { useSettingsPage } from "../hooks/useSettingsPage";

export const Settings: React.FC = () => {
  const {
    backendUrl,

    localBackendUrl,
    setLocalBackendUrl,

    urlMessage,

    appSettings,
    setAppSettings,

    ytStatus,

    configsLoading,
    saveLoading,
    ytLoading,

    message,

    isApiOnline,

    handleSaveUrl,
    handleSaveSettings,
    handleConnectYoutube,
    handleDisconnectYoutube,
  } = useSettingsPage();

  return (
    <div className="space-y-8 text-left animate-fade-in">
      {/* 1. FRONTEND SERVER URL CONFIGURATION */}
      <BackendTargetCard
        localBackendUrl={localBackendUrl}
        setLocalBackendUrl={setLocalBackendUrl}
        handleSaveUrl={handleSaveUrl}
        urlMessage={urlMessage}
      />

      {/* Connection warning */}
      {!isApiOnline && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>
            The API backend is offline. Start the server at{" "}
            <strong>{backendUrl}</strong> to manage integrations and
            credentials.
          </span>
        </div>
      )}

      {/* Loader for Configs */}
      {isApiOnline && configsLoading && (
        <div className="flex items-center gap-2 py-4 text-slate-400 text-sm justify-center">
          <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
          <span>Syncing settings with backend...</span>
        </div>
      )}

      {/* Settings */}
      {isApiOnline && !configsLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Application Settings */}
          <div className="lg:col-span-8">
            <ApplicationSettingsCard
              appSettings={appSettings}
              setAppSettings={setAppSettings}
              message={message}
              saveLoading={saveLoading}
              handleSaveSettings={handleSaveSettings}
            />
          </div>

          {/* YouTube OAuth */}
          <div className="lg:col-span-4 space-y-6">
            <YouTubeCard
              ytStatus={ytStatus}
              ytLoading={ytLoading}
              appSettings={appSettings}
              handleConnectYoutube={handleConnectYoutube}
              handleDisconnectYoutube={handleDisconnectYoutube}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;