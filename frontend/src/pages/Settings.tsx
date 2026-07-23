import React, { useEffect, useState } from 'react';
import {
  // Settings as SettingsIcon,
  Server,
  Key,
  // Youtube,
  Video,
  Save,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import {
  getSettings,
  saveSettings,
  getYoutubeStatus,
  getYoutubeAuthUrl,
  disconnectYoutube,
  // BackendSettings,
  // YoutubeStatus
} from '../api/settings';

import type {
  BackendSettings,
  YoutubeStatus,
} from "../api/settings";

export const Settings: React.FC = () => {
  const { backendUrl, setBackendUrl, isApiOnline } = useSettings();

  // Local settings URL config state
  const [localBackendUrl, setLocalBackendUrl] = useState<string>(backendUrl);
  const [urlMessage, setUrlMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Backend API configs state
  const [apiConfigs, setApiConfigs] = useState<BackendSettings>({
    DEEPGRAM_API_KEY: '',
    GEMINI_API_KEY: '',
    GROQ_API_KEY: '',
    PEXELS_API_KEY: '',
    YOUTUBE_CLIENT_ID: '',
    YOUTUBE_CLIENT_SECRET: '',
  });

  // YouTube integration state
  const [ytStatus, setYtStatus] = useState<YoutubeStatus>({ isConnected: false });

  // Mask keys visibility states
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  // Loading states
  const [configsLoading, setConfigsLoading] = useState<boolean>(true);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [ytLoading, setYtLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchBackendSettings = async () => {
    if (!isApiOnline) {
      setConfigsLoading(false);
      return;
    }
    try {
      setConfigsLoading(true);
      const data = await getSettings();
      setApiConfigs(data);

      const yt = await getYoutubeStatus();
      setYtStatus(yt);

      setMessage(null);
    } catch (err: any) {
      console.error('Failed to load settings from server', err);
      setMessage({ type: 'error', text: 'Failed to fetch settings from Express backend.' });
    } finally {
      setConfigsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendSettings();
  }, [isApiOnline]);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localBackendUrl.trim()) return;

    setBackendUrl(localBackendUrl.trim());
    setUrlMessage({ type: 'success', text: 'Backend URL updated in local storage! Syncing status...' });

    // Automatically fade out success message
    setTimeout(() => setUrlMessage(null), 3000);
  };

  const handleSaveApiConfigs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApiOnline) return;

    setSaveLoading(true);
    setMessage(null);

    try {
      await saveSettings(apiConfigs);
      setMessage({ type: 'success', text: 'API configurations successfully saved to backend .env file!' });
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      console.error('Failed to save settings to server', err);
      setMessage({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to save configurations.' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleConnectYoutube = async () => {
    if (!isApiOnline) return;
    setYtLoading(true);
    try {
      const data = await getYoutubeAuthUrl();
      // Redirect or open Google OAuth popup
      window.location.href = data.url;
    } catch (err: any) {
      console.error('Failed to get YouTube auth URL', err);
      alert('OAuth failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setYtLoading(false);
    }
  };

  const handleDisconnectYoutube = async () => {
    if (!isApiOnline || !window.confirm('Are you sure you want to unlink your YouTube channel?')) {
      return;
    }
    setYtLoading(true);
    try {
      await disconnectYoutube();
      setYtStatus({ isConnected: false });
      alert('YouTube Channel disconnected successfully.');
    } catch (err: any) {
      console.error('Failed to disconnect YouTube', err);
      alert('Disconnect failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setYtLoading(false);
    }
  };

  const toggleKeyVisibility = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8 text-left animate-fade-in">

      {/* 1. FRONTEND SERVER URL CONFIGURATION */}
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
                className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors"
              />
              <button
                type="submit"
                className="px-5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 hover:bg-slate-700 transition-colors text-xs font-semibold"
              >
                Apply
              </button>
            </div>
          </div>

          {urlMessage && (
            <p className={`text-xs ${urlMessage.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {urlMessage.text}
            </p>
          )}
        </form>
      </div>

      {/* Connection warning */}
      {!isApiOnline && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>The API backend is offline. Start the server at <strong>{backendUrl}</strong> to manage integrations and credentials.</span>
        </div>
      )}

      {/* Loader for Configs */}
      {isApiOnline && configsLoading && (
        <div className="flex items-center gap-2 py-4 text-slate-400 text-sm justify-center">
          <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
          <span>Syncing settings with backend...</span>
        </div>
      )}

      {/* 2. BACKEND API KEYS CONFIGURATION */}
      {isApiOnline && !configsLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* API Keys form */}
          <div className="lg:col-span-8">
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
                <Key className="w-5 h-5 text-violet-400" />
                <h3 className="text-lg font-bold text-white">System API Credentials</h3>
              </div>

              <form onSubmit={handleSaveApiConfigs} className="space-y-5">
                {message && (
                  <div className={`p-4 rounded-xl text-xs flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    <span>{message.text}</span>
                  </div>
                )}

                {/* API Input grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Keys mapping list */}
                  {[
                    { key: 'GEMINI_API_KEY', label: 'Gemini (Google) Key', placeholder: 'AI script/prompts' },
                    { key: 'DEEPGRAM_API_KEY', label: 'Deepgram Key', placeholder: 'TTS & Whisper STT' },
                    { key: 'GROQ_API_KEY', label: 'Groq Key', placeholder: 'Fallback script logic' },
                    { key: 'PEXELS_API_KEY', label: 'Pexels stock Key', placeholder: 'Stock footage queries' },
                  ].map((field) => (
                    <div key={field.key} className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{field.label}</label>
                      <div className="relative">
                        <input
                          type={showKeys[field.key] ? 'text' : 'password'}
                          value={(apiConfigs as any)[field.key] || ''}
                          onChange={(e) => setApiConfigs((prev) => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => toggleKeyVisibility(field.key)}
                          className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-350"
                        >
                          {showKeys[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}

                </div>

                {/* YouTube OAuth credentials block */}
                <div className="pt-4 border-t border-slate-800/80 space-y-4">
                  <h4 className="text-sm font-bold text-white">YouTube Integration Credentials</h4>
                  <p className="text-[10px] text-slate-500 leading-normal max-w-xl">
                    Provide the OAuth client credentials generated in the Google Cloud Console. These keys are required to establish connection tokens for publishing reels.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">OAuth Client ID</label>
                      <input
                        type="text"
                        value={apiConfigs.YOUTUBE_CLIENT_ID || ''}
                        onChange={(e) => setApiConfigs((prev) => ({ ...prev, YOUTUBE_CLIENT_ID: e.target.value }))}
                        placeholder="Google Client ID"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">OAuth Client Secret</label>
                      <div className="relative">
                        <input
                          type={showKeys.YOUTUBE_CLIENT_SECRET ? 'text' : 'password'}
                          value={apiConfigs.YOUTUBE_CLIENT_SECRET || ''}
                          onChange={(e) => setApiConfigs((prev) => ({ ...prev, YOUTUBE_CLIENT_SECRET: e.target.value }))}
                          placeholder="Google Client Secret"
                          className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => toggleKeyVisibility('YOUTUBE_CLIENT_SECRET')}
                          className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-350"
                        >
                          {showKeys.YOUTUBE_CLIENT_SECRET ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="py-3 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-violet-500/10 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save API Configurations
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* 3. YOUTUBE OAUTH ACCOUNT BLOCK */}
          <div className="lg:col-span-4 space-y-6">
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
                      <img
                        src={ytStatus.avatarUrl}
                        alt="Channel Avatar"
                        className="w-20 h-20 rounded-full border-2 border-rose-500/80 shadow-xl"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center border-2 border-rose-500/35 mx-auto">
                        <Video className="w-8 h-8" />
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 text-white border-2 border-slate-900 rounded-full flex items-center justify-center text-[10px] font-bold">✓</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-white">{ytStatus.channelName || 'YouTube Account'}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">Authorized & Linked</p>
                  </div>

                  <button
                    onClick={handleDisconnectYoutube}
                    disabled={ytLoading}
                    className="w-full py-2.5 rounded-xl border border-rose-900/25 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {ytLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Disconnect Account
                  </button>
                </div>
              ) : (
                // Unlinked account card layout
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
                    disabled={ytLoading || !apiConfigs.YOUTUBE_CLIENT_ID}
                    className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all shadow-lg shadow-rose-600/10 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {ytLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Video className="w-4 h-4" />}
                    Link YouTube Channel
                  </button>

                  {!apiConfigs.YOUTUBE_CLIENT_ID && (
                    <p className="text-[9px] text-rose-400/90 leading-tight">
                      * Setup Google OAuth credentials in System Credentials first to enable authorization.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Settings;
