// frontend/src/hooks/useSettingsPage.ts
import { useEffect, useState } from "react";
import { useSettings } from "../context/SettingsContext";
import { getSettings, saveSettings, getYoutubeStatus, getYoutubeAuthUrl, disconnectYoutube } from '../api/settings';
import type { AppSettings, YoutubeStatus } from "../api/settings";

export function useSettingsPage() {
  const { backendUrl, setBackendUrl, isApiOnline } = useSettings();
  // Local settings URL config state
  const [localBackendUrl, setLocalBackendUrl] = useState<string>(backendUrl);
  const [urlMessage, setUrlMessage] = useState<{ type: "success" | "error"; text: string; } | null>(null);
  // New App Settings State
  const [appSettings, setAppSettings] = useState<AppSettings>({
    provider: "veo",
    uploadToYoutube: true,
    maxLibraryReels: 10,
  });
  // YouTube integration state
  const [ytStatus, setYtStatus] = useState<YoutubeStatus>({ isConnected: false });

  // Loading states
  const [configsLoading, setConfigsLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [ytLoading, setYtLoading] = useState(false);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchBackendSettings();
  }, [isApiOnline, backendUrl]);

  async function fetchBackendSettings() {
    if (!isApiOnline) {
      setConfigsLoading(false);
      return;
    }
    try {
      setConfigsLoading(true);
      const data = await getSettings();
      setAppSettings(data);

      const yt = await getYoutubeStatus();
      setYtStatus(yt);

      setMessage(null);
    } catch (err: any) {
      console.error('Failed to load settings from server', err);
      setMessage({ type: "error", text: "Failed to fetch settings from Express backend." });
    } finally {
      setConfigsLoading(false);
    }
  }

  function handleSaveUrl(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!localBackendUrl.trim()) return;

    setBackendUrl(localBackendUrl.trim());
    setUrlMessage({ type: "success", text: 'Backend URL updated in local storage! Syncing status...' });
    // Automatically fade out success message
    setTimeout(() => setUrlMessage(null), 3000);
  }

  async function handleSaveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isApiOnline) return;

    setSaveLoading(true);
    setMessage(null);

    try {
      await saveSettings(appSettings);
      setMessage({ type: "success", text: 'Application settings saved successfully.' });
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      console.error('Failed to save settings to server', err);
      setMessage({ type: "error", text: err.response?.data?.message || err.message || "Failed to save configurations." });
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleConnectYoutube() {
    if (!isApiOnline) return;
    setMessage(null);
    setYtLoading(true);
    try {
      const { url } = await getYoutubeAuthUrl();
      if (!url) { throw new Error("No authorization URL returned.") }
      window.location.href = url;
    } catch (err: any) {
      console.error("Failed to start YouTube authentication:", err);
      setMessage({ type: "error", text: "Failed to connect YouTube." });
    } finally {
      setYtLoading(false);
    }
  }

  async function handleDisconnectYoutube() {
    if (!isApiOnline || !window.confirm('Are you sure you want to unlink your YouTube channel?')) {
      return;
    }
    setMessage(null);
    setYtLoading(true);
    try {
      await disconnectYoutube();
      setYtStatus({ isConnected: false });
      setMessage({ type: "success", text: "YouTube channel disconnected successfully." });
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      console.error("Failed to disconnect YouTube:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message ?? err.message ?? "Failed to disconnect YouTube."
      });
    } finally {
      setYtLoading(false);
    }
  }

  return {
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
  };
}