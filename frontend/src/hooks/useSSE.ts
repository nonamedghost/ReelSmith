import { useEffect, useRef, useState } from 'react';
import { useSettings } from '../context/SettingsContext';

export interface ProgressMessage {
  type: 'progress' | 'log' | 'completed' | 'error';
  jobId: string;

  step?: 'queued'
  | 'script'
  | 'metadata'
  | 'tts'
  | 'subtitles'
  | 'clips'
  | 'merge'
  | 'thumbnail'
  | 'validate'
  | 'archive'
  | 'completed'
  | 'error';

  progress?: number;
  status?: 'queued' | 'running' | 'completed' | 'failed';
  level?: 'info' | 'warn' | 'error';
  message?: string;
  videoPath?: string;
  error?: string;
}

interface UseSSEProps {
  jobId: string | null;
  onMessage: (message: ProgressMessage) => void;
  onComplete: (videoPath: string) => void;
  onError: (errorMsg: string) => void;
}

export const useSSE = ({
  jobId,
  onMessage,
  onComplete,
  onError,
}: UseSSEProps) => {
  const { backendUrl } = useSettings();

  const abortControllerRef = useRef<AbortController | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    if (!jobId) {
      return;
    }

    const token = localStorage.getItem('auth_token');

    if (!token) {
      onError('Authentication required. Please log in again.');
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const connectSSE = async () => {
      try {
        const url = `${backendUrl}/api/reels/progress/${jobId}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'text/event-stream',
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication failed. Please log in again.');
          }

          if (response.status === 403) {
            throw new Error('Access denied for this generation job.');
          }

          throw new Error(
            `Progress server returned HTTP ${response.status}.`
          );
        }

        if (!response.body) {
          throw new Error('Progress server did not return a readable stream.');
        }

        setIsConnected(true);

        console.log('SSE: Connection opened for Job', jobId);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          const events = buffer.split(/\r?\n\r?\n/);

          // Keep the incomplete event for the next chunk
          buffer = events.pop() || '';

          for (const event of events) {
            const dataLines = event
              .split(/\r?\n/)
              .filter((line) => line.startsWith('data:'))
              .map((line) => line.slice(5).trim());

            if (dataLines.length === 0) {
              continue;
            }

            const data = dataLines.join('\n');

            try {
              const message = JSON.parse(data) as ProgressMessage;

              onMessage(message);

              if (message.type === 'completed') {
                onComplete(message.videoPath || '');

                controller.abort();
                setIsConnected(false);
                return;
              }

              if (message.type === 'error') {
                onError(
                  message.message ??
                  message.error ??
                  'Pipeline failed. Unknown error occurred during generation.'
                );

                controller.abort();
                setIsConnected(false);
                return;
              }
            } catch (err) {
              console.error('SSE: Failed to parse message', err);
            }
          }
        }

        setIsConnected(false);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        console.error('SSE: Connection error', err);

        setIsConnected(false);

        const message =
          err instanceof Error
            ? err.message
            : 'Lost connection to progress server.';

        onError(message);
      }
    };

    connectSSE();

    return () => {
      controller.abort();
      setIsConnected(false);
    };
  }, [jobId, backendUrl]);

  return { isConnected };
};

export default useSSE;