import React from 'react';
import {
  TrendingUp,
  Users,
  Eye,
  Clock,
  Sparkles,
  ArrowUpRight,
  Brain,
} from 'lucide-react';
import { ChannelAnalytics } from '../types/pipeline.js';

interface AnalyticsFeedbackViewProps {
  analytics: ChannelAnalytics;
}

export const AnalyticsFeedbackView: React.FC<AnalyticsFeedbackViewProps> = ({ analytics }) => {
  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              YouTube Performance & Feedback Loop
            </h4>
            <p className="text-xs text-slate-400">
              Live viewer retention metrics algorithmically fine-tuning future story concepts
            </p>
          </div>
        </div>

        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>+24.8% this month</span>
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Channel Views</span>
          </div>
          <strong className="text-lg font-bold text-slate-100">
            {analytics.views.toLocaleString()}
          </strong>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Subscribers</span>
          </div>
          <strong className="text-lg font-bold text-slate-100">
            {analytics.subscribers.toLocaleString()}
          </strong>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Avg View Duration</span>
          </div>
          <strong className="text-lg font-bold text-slate-100">
            {analytics.avgViewDurationSeconds}s ({analytics.avgRetentionRate}%)
          </strong>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
            <span>Click-Through (CTR)</span>
          </div>
          <strong className="text-lg font-bold text-slate-100">
            {analytics.clickThroughRate}%
          </strong>
        </div>
      </div>

      {/* Active Algorithmic Feedback Insights (Fed into Idea Engine) */}
      <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/40 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
          <Brain className="w-4 h-4 text-indigo-400" />
          <span>AUTOMATIC FEEDBACK LOOP RULES (Applied to next idea generation prompt):</span>
        </div>
        <ul className="space-y-1.5 text-xs text-slate-300">
          {analytics.insightsLearned.map((insight, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
