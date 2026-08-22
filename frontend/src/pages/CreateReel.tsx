import { useState, useEffect } from 'react';
import { getSettings } from '../api/settings';
import {
  Play,
  Sparkles,
  RotateCw,
  FileText,
  Volume2,
  Video as VideoIcon,
  Download,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { getRandomTopic, generateReel, getLatestReel, type ReelMetadata } from '../api/reels';
import { useSettings } from '../context/SettingsContext';
import { TerminalView } from '../components/generator/TerminalView';
import { StepTracker, type StepStatus, PIPELINE_STEPS } from '../components/generator/StepTracker';
import useSSE, { type ProgressMessage } from '../hooks/useSSE';

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" {...props}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.003 3.003 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107c1.883.511 9.388.511 9.388.511s7.505 0 9.388-.511a3.003 3.003 0 0 0 2.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const VOICE_OPTIONS = [
  { value: 'aura-2-thalia-en', label: 'Thalia (Female - Bright)' },
  { value: 'aura-2-orpheus-en', label: 'Orpheus (Male - Rich)' },
  { value: 'aura-2-helios-en', label: 'Helios (Male - Warm)' },
  { value: 'aura-2-arcas-en', label: 'Arcas (Male - Deep)' },
];

const PROVIDER_OPTIONS = [
  { value: 'pexels', label: 'Pexels stock provider (Fast)' },
  { value: 'veo', label: 'Google Gemini Veo provider (AI visuals)' },
];

export const CreateReel: React.FC = () => {
  const { backendUrl, isApiOnline } = useSettings();

  // Form states
  const [topic, setTopic] = useState<string>('');
  const [scriptText, setScriptText] = useState<string>('');
  const [voice, setVoice] = useState<string>('aura-2-thalia-en');
  const [provider, setProvider] = useState<string>('pexels');
  const [uploadToYoutube, setUploadToYoutube] = useState<boolean>(false);

  // Loading & generation tracking states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [currentStage, setCurrentStage] = useState<string>('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [stepStatuses, setStepStatuses] = useState<Record<string, StepStatus>>({});

  // Results states
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ReelMetadata | null>(null);

  useEffect(() => {
    if (!isApiOnline) return;

    const loadSettings = async () => {
      try {
        const settings = await getSettings();

        setProvider(settings.provider);
        setUploadToYoutube(settings.uploadToYoutube);
      } catch (err) {
        console.error('Failed to load application settings:', err);
      }
    };

    loadSettings();
  }, [isApiOnline, backendUrl]);

  // SSE streaming hooks
  useSSE({
    jobId,
    onMessage: (message: ProgressMessage) => {
      // Terminal logs
      if (message.type === 'log' && message.message) {
        setLogs((prev) => [...prev, message.message]);
      }
      // Only progress events should update the StepTracker
      if (message.type === 'progress') {
        setCurrentStage(message.step || '');
        // Update step statuses based on current pipeline reports
        setStepStatuses((prev) => {
          const next = { ...prev };

          // Find index of current stage in sequence
          const stageIndex = PIPELINE_STEPS.findIndex((s) => s.key === message.step);

          // Mark all steps before current stage as successful if they aren't already
          PIPELINE_STEPS.forEach((step, idx) => {
            if (idx < stageIndex) {
              next[step.key] = 'success';
            } else if (idx === stageIndex) {
              next[step.key] = 'running';
            } else {
              next[step.key] = 'pending';
            }
          });

          return next;
        });
      }
    },
    onComplete: async () => {
      setIsGenerating(false);
      setLogs((prev) => [...prev, '🎉 Reel generation completed successfully!']);

      // Complete all steps
      setStepStatuses((prev) => {
        const next = { ...prev };
        PIPELINE_STEPS.forEach((step) => {
          next[step.key] = 'success';
        });
        return next;
      });

      // Retrieve the generated reel details
      try {
        const latest = await getLatestReel();

        if (latest) {
          if (latest.metadata) {
            setMetadata(latest.metadata);
          }
          setVideoPath(`${backendUrl}/api/reels/video/${latest.id}?t=${Date.now()}`);
        }
      } catch (err) {
        console.error('Failed to retrieve latest video metadata', err);
        setErrorMsg('Video generated successfully, but metadata retrieval failed.');
      }
    },
    onError: (errorText: string) => {
      setIsGenerating(false);
      setErrorMsg(errorText);
      setLogs((prev) => [...prev, `❌ Pipeline Error: ${errorText}`]);

      if (currentStage) {
        setStepStatuses((prev) => ({
          ...prev,
          [currentStage]: 'failed',
        }));
      }
    },
  });

  const handleRollTopic = async () => {
    if (!isApiOnline) return;
    try {
      const data = await getRandomTopic();
      setTopic(data.topic);
    } catch (err) {
      console.error('Failed to get random topic', err);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setErrorMsg(null);
    setVideoPath(null);
    setMetadata(null);
    setLogs(['🚀 Handshaking with backend and spawning pipeline job...']);
    setCurrentStage('script');
    setJobId(null);

    // Reset statuses to pending/running for first
    const initialStatuses: Record<string, StepStatus> = {};
    PIPELINE_STEPS.forEach((step, idx) => {
      initialStatuses[step.key] = idx === 0 ? 'running' : 'pending';
    });
    setStepStatuses(initialStatuses);

    try {
      const data = await generateReel({
        topic: topic.trim(),
        scriptText: scriptText.trim() || undefined,
        voice,
        provider,
        uploadToYoutube,
      });
      setJobId(data.jobId);
    } catch (err: any) {
      setIsGenerating(false);
      const errMsg = err.response?.data?.message || err.message || 'Server connection failed.';
      setErrorMsg(errMsg);
      setLogs((prev) => [...prev, `❌ Connection Failed: ${errMsg}`]);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Settings warning */}
      {!isApiOnline && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>The API backend is offline. Please start your backend server or configure the backend URL in the <strong>Settings</strong> page.</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

        {/* LEFT COLUMN: CONFIGURATION FORM */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <h3 className="text-lg font-bold text-white">Generation Parameters</h3>
            </div>

            <form onSubmit={handleGenerate} className="space-y-5">

              {/* Topic Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Video Topic</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={isGenerating || !isApiOnline}
                    placeholder="e.g. Crazy space facts"
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={handleRollTopic}
                    disabled={isGenerating || !isApiOnline}
                    className="px-3.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 hover:bg-slate-700 transition-colors flex items-center justify-center disabled:opacity-50"
                    title="Roll Random Topic"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Custom Script Textarea */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  Custom Script <span className="text-[10px] text-slate-600 lowercase">(optional)</span>
                </label>
                <textarea
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  disabled={isGenerating || !isApiOnline}
                  placeholder="Provide your own narration script. If empty, AI script generation will execute."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors disabled:opacity-50 resize-none font-sans text-sm leading-relaxed"
                />
              </div>

              {/* Voice Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                  TTS Voice model
                </label>
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  disabled={isGenerating || !isApiOnline}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors disabled:opacity-50 text-sm"
                >
                  {VOICE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Visual Provider Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <VideoIcon className="w-3.5 h-3.5 text-slate-500" />
                  Visual Clips Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  disabled={isGenerating || !isApiOnline}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors disabled:opacity-50 text-sm"
                >
                  {PROVIDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* YouTube Upload Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <YoutubeIcon className="w-5 h-5 text-rose-500" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-white">Publish to YouTube</p>
                    <p className="text-[10px] text-slate-500">Automatically uploads finished video</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={uploadToYoutube}
                    onChange={(e) => setUploadToYoutube(e.target.checked)}
                    disabled={isGenerating || !isApiOnline}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600 peer-checked:after:bg-white peer-checked:after:border-white"></div>
                </label>
              </div>

              {/* Submit Trigger */}
              <button
                type="submit"
                disabled={isGenerating || !topic.trim() || !isApiOnline}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none text-sm"
              >
                {isGenerating ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Generating Reel...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Generate Reel</span>
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: PIPELINE PROGRESS AND OUTPUTS */}
        <div className="lg:col-span-7 space-y-6">

          {/* Visual Step Progress Tracker */}
          <StepTracker /*currentStage={currentStage}*/ statuses={stepStatuses} />

          {/* Terminal Console Logs */}
          <TerminalView logs={logs} />

          {/* Video Preview Panel */}
          {videoPath && (
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 animate-fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">Generated Video</h3>
                </div>
                <a
                  href={videoPath}
                  download="reel.mp4"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Reel
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Embedded HTML5 Player */}
                <div className="md:col-span-5 flex items-center justify-center">
                  <div className="w-48 aspect-[9/16] rounded-xl overflow-hidden bg-black border border-slate-800 shadow-xl relative group">
                    <video
                      src={videoPath}
                      controls
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Metadata Details Card */}
                {metadata && (
                  <div className="md:col-span-7 space-y-4 text-left">
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Suggested Title</h4>
                      <p className="text-sm font-semibold text-slate-200 mt-1">{metadata.title}</p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</h4>
                      <p className="text-xs text-slate-400 mt-1 whitespace-pre-line leading-relaxed max-h-24 overflow-y-auto custom-scrollbar">
                        {metadata.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Suggested Tags</h4>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {metadata.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300 border border-slate-700/50"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateReel;
