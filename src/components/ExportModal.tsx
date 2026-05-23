import React, { useState } from 'react';
import { Download, Copy, Check, FileCode, CheckCircle2, Award, X, Sparkles, LayoutGrid } from 'lucide-react';
import { PolicyRule, TrainingLog } from '../types';

interface ExportModalProps {
  policies: PolicyRule[];
  logs: TrainingLog[];
  trustScore: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportModal({
  policies,
  logs,
  trustScore,
  isOpen,
  onClose
}: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<'spark' | 'openclaw' | 'hermes'>('spark');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Formulate code blocks
  const activeRules = policies.filter(p => p.isActive);

  const getSparkConfig = () => {
    return JSON.stringify({
      agentName: "AgentGym-Validated-SubAgent",
      engine: "gemini-3.5-flash",
      temperature: 0.1,
      trustRating: `${Math.max(30, Math.min(99, 70 + trustScore * 0.25))}%`,
      validatedDecisionsCount: logs.length,
      alignmentPolicies: activeRules.map(r => ({
        ruleId: r.id,
        context: r.title,
        promptOverride: r.instructions
      })),
      safetyControls: {
        autoDispatchAllowed: trustScore >= 40,
        untrustedThreshold: -15,
        reEvaluationRequiredOn: ["billing_failure", "critical_legal", "family_emergency"]
      }
    }, null, 2);
  };

  const getOpenClawConfig = () => {
    return `version: "claw.v2.0"
metadata:
  name: "Yves Sandbox Mail Agent"
  deployment_mode: "semi_autonomous"
  verified_accuracy: "${Math.max(30, Math.min(100, 75 + trustScore * 0.25))}%"
policies:
${activeRules.map(r => `  - id: "${r.id}"
    context: "${r.title}"
    action: "override_auto_defaults"
    directive: "${r.instructions}"`).join('\n')}
triggers:
  on_error: "prompt_human_approval"
  safety_valve: "true"`;
  };

  const getHermesBlueprint = () => {
    return `// Hermes-v3 Training Weights Blueprint
{
  "optimizer": "Reinforcement-Learning-Inbox",
  "rewards": {
    "human_approved_actions": 10,
    "prevented_deficient_automations": 15
  },
  "constraints": [
    ${activeRules.map(r => `{"id": "${r.id}", "prompt": "${r.instructions}"}`).join(',\n    ')}
  ],
  "weights_tuning": {
    "trustScore": ${trustScore},
    "exploration_decay": 0.05
  }
}`;
  };

  const getActiveCode = () => {
    if (activeTab === 'spark') return getSparkConfig();
    if (activeTab === 'openclaw') return getOpenClawConfig();
    return getHermesBlueprint();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh] relative animate-fade-in">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-1 bg-slate-50 hover:bg-slate-100 rounded-full transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title Header */}
        <div className="flex items-center gap-3.5 mb-5 border-b border-slate-100 pb-4">
          <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <LayoutGrid className="h-5.5 w-5.5" />
          </div>
          <div>
            <h2 className="text-md font-bold text-slate-900 flex items-center gap-1.5">
              Refined Sub-Agent Package exporter <Sparkles className="h-4.5 w-4.5 text-blue-500 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-500">Deploy validated reinforcement rules directly to external agent runtimes</p>
          </div>
        </div>

        {/* Overall Score indicators */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Active Rules</span>
            <p className="text-md font-bold text-slate-800 mt-0.5">{activeRules.length} Approved</p>
            <p className="text-[9.5px] text-slate-400">Policy alignment overrides</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Accuracy Rating</span>
            <p className="text-md font-bold text-slate-800 mt-0.5">
              {Math.max(30, Math.min(100, 75 + trustScore * 0.25)).toFixed(0)}% Match
            </p>
            <p className="text-[9.5px] text-slate-400">Reward alignment rating</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Status</span>
            <p className={`text-md font-bold mt-0.5 uppercase ${trustScore >= 40 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {trustScore >= 40 ? '🚀 EXPORTABLE' : '🎯 TRAINING'}
            </p>
            <p className="text-[9.5px] text-slate-400">Requires &ge; +40 pts</p>
          </div>
        </div>

        {/* Selection Tabs */}
        <div className="flex border-b border-slate-200 text-xs font-semibold mb-4 bg-slate-50 p-1.5 rounded-xl">
          {[
            { id: 'spark', label: 'Gemini Spark (Recommended)' },
            { id: 'openclaw', label: 'OpenClaw Manifest' },
            { id: 'hermes', label: 'Hermes Blueprint' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 text-center rounded-lg transition font-bold ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Big Code View */}
        <div className="flex-1 bg-slate-900 rounded-2xl p-4 overflow-hidden flex flex-col h-64 border border-slate-800 relative">
          <div className="flex justify-between items-center text-slate-500 mb-2 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <FileCode className="h-4 w-4 text-slate-400" />
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono">
                {activeTab}.{activeTab === 'openclaw' ? 'yaml' : 'json'}
              </span>
            </div>
            
            <button
              onClick={handleCopy}
              className="text-[10px] font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 py-1 px-2 hover:bg-slate-800 rounded-lg transition"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy Code
                </>
              )}
            </button>
          </div>

          <pre className="flex-1 overflow-auto text-xs text-blue-300 font-mono text-left leading-relaxed select-all">
            {getActiveCode()}
          </pre>
        </div>

        {/* Exporter instructions */}
        <div className="mt-5 border-t border-slate-100 pt-4 flex justify-between items-center">
          <div className="text-[10.5px] text-slate-500 max-w-sm leading-relaxed">
            <span className="font-bold text-slate-700 block">How to install:</span> Add this manifest securely into your agent's config folder. Your sub-agents will dynamically enforce these guidelines during inbox sweeps!
          </div>

          <button
            onClick={handleCopy}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-xs transition"
          >
            <Download className="h-4 w-4" /> Export Config Bundle
          </button>
        </div>

      </div>
    </div>
  );
}
