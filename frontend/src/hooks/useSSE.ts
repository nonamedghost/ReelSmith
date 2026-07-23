import { useEffect, useRef, useState } from 'react';
import { useSettings } from '../context/SettingsContext';

export interface ProgressMessage {
  jobId: string;
  stage: 'script' | 'metadata' | 'tts' | 'subtitles' | 'clips' | 'merge' | 'validate' | 'youtube' | 'complete' | 'error';
  log: string;
  percentage: number;
  status: 'running' | 'success' | 'failed';
  videoPath?: string;
  error?: string;
}

interface UseSSEProps {
  jobId: string | null;
  onMessage: (message: ProgressMessage) => void;
  onComplete: (videoPath: string) => void;
  onError: (errorMsg: string) => void;
}

export const useSSE = ({ jobId, onMessage, onComplete, onError }: UseSSEProps) => {
  const { backendUrl } = useSettings();
  const eventSourceRef = useRef<EventSource | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    if (!jobId) {
      return;
    }

    setIsConnected(true);
    const url = `${backendUrl}/api/reels/progress?jobId=${jobId}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      console.log('SSE: Connection opened for Job', jobId);
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as ProgressMessage;
        onMessage(data);

        if (data.stage === 'complete' && data.status === 'success') {
          onComplete(data.videoPath || '');
          es.close();
          setIsConnected(false);
        } else if (data.stage === 'error' || data.status === 'failed') {
          onError(data.error || data.log || 'An unknown error occurred during generation.');
          es.close();
          setIsConnected(false);
        }
      } catch (err) {
        console.error('SSE: Failed to parse message', err);
      }
    };

    es.onerror = (err) => {
      console.error('SSE: Connection error', err);
      onError('Lost connection to progress server.');
      es.close();
      setIsConnected(false);
    };

    return () => {
      es.close();
      setIsConnected(false);
    };
  }, [jobId, backendUrl]);

  return { isConnected };
};

export default useSSE;
