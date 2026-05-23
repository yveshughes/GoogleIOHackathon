import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Plus, HelpCircle, Shield, Check, Info } from 'lucide-react';
import { PolicyRule } from '../types';

interface PolicyManagerProps {
  policies: PolicyRule[];
  onTogglePolicy: (id: string) => void;
  onAddPolicy: (title: string, instructions: string) => void;
}

export default function PolicyManager({
  policies,
  onTogglePolicy,
  onAddPolicy
}: PolicyManagerProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newInstructions) return;
    onAddPolicy(newTitle, newInstructions);
    setNewTitle('');
    setNewInstructions('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 font-sans shadow-xs">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Shield className="h-4.5 w-4.5 text-blue-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Sub-Agent Alignment Constraints</h3>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold transition"
        >
          <Plus className="h-3 w-3" /> New Policy
        </button>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
        Active prompt constraints determine how Gemini generates Option selections and drafts in the Sandbox. Override deficient default automations here.
      </p>

      {/* New Policy Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 space-y-2.5">
          <h4 className="text-[11px] font-bold text-slate-700 uppercase">Define Custom Gym Constraint</h4>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Title / Context</label>
            <input
              type="text"
              placeholder="e.g. Prevent Family Calendars"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 placeholder-slate-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Instructions for Gemini Sub-agent</label>
            <textarea
              placeholder="e.g. If sender is family (like Nina), do not provide cold auto-scheduler links. Respond personally with warm confirmation."
              rows={2}
              value={newInstructions}
              onChange={(e) => setNewInstructions(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 placeholder-slate-400 outline-none resize-none"
            />
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-[10px] text-slate-500 hover:text-slate-800 font-semibold px-2 py-1 bg-slate-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-[10px] text-white hover:bg-blue-700 font-bold px-2.5 py-1 bg-blue-600 rounded"
            >
              Attach Constraint
            </button>
          </div>
        </form>
      )}

      {/* Rules list */}
      <div className="space-y-2">
        {policies.map((rule) => (
          <div
            key={rule.id}
            className={`p-2 rounded-xl border flex items-start gap-2.5 transition ${
              rule.isActive ? 'border-blue-150 bg-blue-50/15' : 'border-slate-150 bg-slate-50/20 opacity-70'
            }`}
          >
            <button
              type="button"
              onClick={() => onTogglePolicy(rule.id)}
              className="mt-0.5 text-slate-400 hover:text-blue-600 transition"
            >
              {rule.isActive ? (
                <ToggleRight className="h-5 w-5 text-blue-600" />
              ) : (
                <ToggleLeft className="h-5 w-5 text-slate-400" />
              )}
            </button>

            <div className="flex-1 min-w-0 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <span>{rule.title}</span>
                {rule.isActive && (
                  <span className="text-[8px] bg-emerald-100 text-emerald-700 font-bold px-1 rounded-sm uppercase">Active</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{rule.instructions}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
