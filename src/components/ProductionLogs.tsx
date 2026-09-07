import React, { useState } from 'react';
import { Terminal, CheckCircle2, AlertTriangle, XCircle, Info, Filter } from 'lucide-react';
import { ProductionLog } from '../types/pipeline.js';

interface ProductionLogsProps {
  logs: ProductionLog[];
}

export const ProductionLogs: React.FC<ProductionLogsProps> = ({ logs }) => {
  const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'error' | 'success'>('all');

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    return log.level === filter;
  });

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Live Production Log Stream ({logs.length})
          </h4>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          {(['all', 'info', 'success', 'warn', 'error'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono capitalize transition-colors ${
                filter === lvl
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-72 overflow-y-auto rounded-xl bg-slate-950 p-3 font-mono text-xs space-y-1.5 border border-slate-800/80">
        {filteredLogs.slice().reverse().map((log) => {
          const time = new Date(log.timestamp).toLocaleTimeString();
          return (
            <div key={log.id} className="flex items-start gap-2.5 py-0.5 text-slate-300">
              <span className="text-slate-500 shrink-0 text-[11px]">{time}</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold shrink-0 ${
                  log.level === 'success'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                    : log.level === 'warn'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800/50'
                    : log.level === 'error'
                    ? 'bg-rose-950 text-rose-400 border border-rose-800/50'
                    : 'bg-slate-800 text-indigo-300'
                }`}
              >
                {log.stage || 'CORE'}
              </span>
              <span className="flex-1 leading-relaxed">{log.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
