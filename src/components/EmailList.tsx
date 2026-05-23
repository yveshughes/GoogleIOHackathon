import React, { useState } from 'react';
import { Mail, Shield, CheckCircle2, ChevronRight, Settings, Loader2, Sparkles, Star, Search, Filter } from 'lucide-react';
import { Email } from '../types';

interface EmailListProps {
  emails: Email[];
  selectedEmailId: string | null;
  onSelectEmail: (id: string) => void;
  isLoadingSandbox: boolean;
  onComposeCustom: () => void;
  sandboxProgress: number;
  userEmail: string;
}

export default function EmailList({
  emails,
  selectedEmailId,
  onSelectEmail,
  isLoadingSandbox,
  onComposeCustom,
  sandboxProgress,
  userEmail
}: EmailListProps) {
  const [activeTab, setActiveTab] = useState<'primary' | 'social' | 'promotions' | 'updates'>('primary');
  const [searchQuery, setSearchQuery] = useState('');

  // Sorters
  const filteredEmails = emails
    .filter(e => e.category === activeTab)
    .filter(e => {
      const query = searchQuery.toLowerCase();
      return (
        e.sender.toLowerCase().includes(query) ||
        e.subject.toLowerCase().includes(query) ||
        e.body.toLowerCase().includes(query)
      );
    });

  // Steps for sandbox construction
  const sandboxSteps = [
    { label: 'Securely mirroring workspace credentials...', trigger: 15 },
    { label: `Cloning folders safely for ${userEmail}...`, trigger: 40 },
    { label: 'Deploying Gemini 3.5 Flash sub-agents...', trigger: 70 },
    { label: 'Synthesizing Rambler navigation paths in sandbox...', trigger: 95 },
    { label: 'Sandbox Isolation Established. Launching AgentGym!', trigger: 101 },
  ];

  if (isLoadingSandbox) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-900 text-white font-sans h-full">
        <div className="max-w-md w-full bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-2xl relative overflow-hidden">
          {/* Glowing halo */}
          <div className="absolute -top-10 -right-10 h-32 w-32 bg-blue-500/20 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center gap-3.5 mb-6">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center animate-pulse">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">AgentGym Mail</h2>
              <p className="text-xs text-slate-400">Secure Sandboxed Reinforcement Learning Environment</p>
            </div>
          </div>

          <div className="mb-6 relative">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400 font-medium">Formulating Sandbox Sandbox...</span>
              <span className="text-xs font-bold text-blue-400 font-mono">{sandboxProgress.toFixed(0)}%</span>
            </div>
            
            {/* ProgressBar */}
            <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300" 
                style={{ width: `${sandboxProgress}%` }}
              />
            </div>
          </div>

          {/* Stepper list */}
          <div className="space-y-3.5 pt-2 border-t border-slate-700/50">
            {sandboxSteps.map((step, index) => {
              const completed = sandboxProgress >= step.trigger;
              const active = sandboxProgress < step.trigger && (index === 0 || sandboxProgress >= sandboxSteps[index - 1].trigger);
              
              return (
                <div 
                  key={index}
                  className={`flex items-start gap-3 text-xs transition-opacity duration-300 ${
                    completed ? 'text-blue-400' : active ? 'text-white' : 'text-slate-500'
                  }`}
                >
                  {completed ? (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                  ) : active ? (
                    <Loader2 className="h-4 w-4 flex-shrink-0 text-blue-400 animate-spin" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-slate-600 flex items-center justify-center text-[9px] font-bold font-mono">
                      {index + 1}
                    </div>
                  )}
                  <span className={`${active ? 'font-semibold' : ''}`}>{step.label}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-[10px] text-slate-400 font-mono text-center border-t border-slate-700/30 pt-4">
            Zero operations will be performed on your real inbox. Live safety lock is engaged.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-105 flex-shrink-0 border-r border-slate-200 flex flex-col h-full bg-white font-sans">
      {/* Search and Filters Header */}
      <div className="p-3 border-b border-slate-250 bg-slate-50/50 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            id="inbox-search-input"
            type="text"
            placeholder="Search sandbox mail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white hover:bg-slate-100 focus:bg-white border border-slate-300 rounded-lg py-1.5 pl-9 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Filter className="h-3 w-3" />
            <span>Sandbox isolated items ({filteredEmails.length})</span>
          </div>
          <button
            onClick={onComposeCustom}
            className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-semibold bg-blue-50/50 hover:bg-blue-50 border border-blue-200/50 px-2 py-0.5 rounded-md transition"
          >
            <Sparkles className="h-3 w-3" /> Custom Email
          </button>
        </div>
      </div>

      {/* Gmail-Style Tabs Banner */}
      <div className="flex border-b border-slate-200 text-xs font-semibold select-none bg-slate-50/30">
        {[
          { id: 'primary', label: 'Primary', color: 'border-blue-600 text-blue-600', activeBg: 'bg-blue-50/20' },
          { id: 'social', label: 'Social', color: 'border-green-600 text-green-700', activeBg: 'bg-green-50/20' },
          { id: 'promotions', label: 'Promotions', color: 'border-amber-500 text-amber-700', activeBg: 'bg-amber-50/20' },
          { id: 'updates', label: 'Updates', color: 'border-purple-600 text-purple-700', activeBg: 'bg-purple-50/20' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 text-center border-b-2 transition relative ${
                isActive ? `${tab.color} ${tab.activeBg}` : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-current" />
              )}
            </button>
          );
        })}
      </div>

      {/* Email Cards Container */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100" id="inbox-email-list-container">
        {filteredEmails.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center h-48">
            <Mail className="h-8 w-8 text-slate-300 mb-2" />
            <p className="font-medium text-slate-500">No emails matched filters</p>
            <p className="text-[10px] text-slate-400 mt-1">Try another category or search query.</p>
          </div>
        ) : (
          filteredEmails.map((email) => {
            const isSelected = selectedEmailId === email.id;
            const isUnread = email.status === 'unread';
            
            return (
              <div
                key={email.id}
                onClick={() => onSelectEmail(email.id)}
                className={`p-3 text-left cursor-pointer transition relative flex gap-2.5 ${
                  isSelected 
                    ? 'bg-blue-50/80 border-l-3 border-blue-600 shadow-2xs' 
                    : isUnread 
                    ? 'bg-white hover:bg-slate-50 font-semibold' 
                    : 'bg-slate-50/30 hover:bg-slate-50 font-normal'
                }`}
              >
                {/* Checkbox indicator */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  className="mt-0.5 h-3.5 w-3.5 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 outline-none cursor-pointer self-start"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-1.5 mb-1">
                    <span className={`text-xs truncate ${isUnread ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                      {email.sender}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-medium flex-shrink-0">
                      {email.date}
                    </span>
                  </div>

                  <h4 className={`text-xs truncate text-slate-900 ${isUnread ? 'font-bold' : 'font-semibold'}`}>
                    {email.subject}
                  </h4>
                  
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {email.body}
                  </p>

                  {/* Badge tags */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {email.starred && (
                      <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                    )}
                    {email.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-600 tracking-tight"
                      >
                        {tag}
                      </span>
                    ))}
                    
                    {/* Failed Warning Badge */}
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold bg-red-50 text-red-600 border border-red-100 ml-auto">
                      needs retraining
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stats Quick Summary */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500 font-semibold">
        <span>Active Sandbox Environment</span>
        <span className="font-mono bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-sm">Secure Mirror Only</span>
      </div>
    </div>
  );
}
