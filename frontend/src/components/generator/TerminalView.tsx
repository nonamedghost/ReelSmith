import React, { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';

interface TerminalViewProps {
  logs: string[];
}

export const TerminalView: React.FC<TerminalViewProps> = ({ logs }) => {
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Scroll to the bottom of terminal when logs update
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col h-72 w-full rounded-xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden font-mono text-xs leading-relaxed text-slate-300">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-2 text-slate-400">
          <Terminal className="w-4 h-4 text-violet-400" />
          <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Console Output</span>
        </div>
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
        </div>
      </div>

      {/* Terminal Content Screen */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2 select-text custom-scrollbar">
        {logs.length === 0 ? (
          <div className="text-slate-600 italic">Terminal idle. Start generation to view pipeline logs...</div>
        ) : (
          logs.map((log, index) => {
            let logColorClass = 'text-slate-300';
            if (log.includes('✅') || log.toLowerCase().includes('success')) {
              logColorClass = 'text-emerald-400';
            } else if (log.includes('❌') || log.toLowerCase().includes('failed') || log.toLowerCase().includes('error')) {
              logColorClass = 'text-rose-400 font-semibold';
            } else if (log.includes('⚠') || log.includes('WARNING') || log.toLowerCase().includes('warn')) {
              logColorClass = 'text-amber-400';
            } else if (log.toLowerCase().includes('starting') || log.includes('🚀')) {
              logColorClass = 'text-indigo-400';
            }

            return (
              <div key={index} className={`whitespace-pre-wrap ${logColorClass}`}>
                <span className="text-slate-600 mr-2 select-none">$&gt;</span>
                {log}
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};

export default TerminalView;
