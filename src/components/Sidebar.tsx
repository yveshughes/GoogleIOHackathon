import React, { useRef, useEffect, useState } from 'react';
import { Mail, Star, Clock, Send, File, ChevronDown, Check, Video, ShieldAlert, Award, RefreshCw, Settings, Play, Pause, Presentation, Mic, Hand, Volume2, ClipboardList, Pencil, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Email } from '../types';

interface SidebarProps {
  emails: Email[];
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  trustScore: number;
  onReset: () => void;
  userEmail: string;
  selectedEmail?: Email | null;
  gmailToken: string | null;
  activeGmailEmail: string | null;
  isSyncingGmail: boolean;
  onConnectGmail: () => void;
  isGeneratingOptions?: boolean;
}

export default function Sidebar({
  emails,
  activeMenu,
  setActiveMenu,
  trustScore,
  onReset,
  userEmail,
  selectedEmail,
  gmailToken,
  activeGmailEmail,
  isSyncingGmail,
  onConnectGmail,
  isGeneratingOptions = false
}: SidebarProps) {
  const [prevTrustScore, setPrevTrustScore] = useState<number>(trustScore);
  const [showBriefPoints, setShowBriefPoints] = useState<boolean>(false);
  const [deltaScore, setDeltaScore] = useState<number | null>(null);

  const [loadingStep, setLoadingStep] = useState<number>(0);

  useEffect(() => {
    if (isGeneratingOptions) {
      setLoadingStep(1);
      const t1 = setTimeout(() => setLoadingStep(2), 800);
      const t2 = setTimeout(() => setLoadingStep(3), 1600);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      setLoadingStep(0);
    }
  }, [isGeneratingOptions]);

  const renderAgentStatus = (step: number) => {
    if (isGeneratingOptions) {
      if (loadingStep === step) {
        return (
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-blue-500 font-bold font-mono animate-pulse">Running</span>
            <RefreshCw className="h-3 w-3 text-blue-500 animate-spin shrink-0" />
          </div>
        );
      } else if (loadingStep > step) {
        return (
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-emerald-600 font-bold font-mono">Done</span>
            <div className="h-3.5 w-3.5 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-600 flex items-center justify-center text-[8px] font-extrabold font-mono shrink-0">✓</div>
          </div>
        );
      } else {
        return (
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-slate-400 font-mono">Queued</span>
            <div className="h-1.5 w-1.5 rounded-full bg-slate-350 shrink-0 mr-1" />
          </div>
        );
      }
    } else if (selectedEmail) {
      return (
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-emerald-600 font-bold font-mono">Aligned</span>
          <div className="h-3.5 w-3.5 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-600 flex items-center justify-center text-[8px] font-extrabold font-mono shrink-0">✓</div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-slate-400 font-mono">Waiting</span>
          <div className="h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0 mr-1" />
        </div>
      );
    }
  };

  const renderEngineStatus = () => {
    if (isGeneratingOptions) {
      return (
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-amber-500 font-bold font-mono animate-pulse">Synthesizing</span>
          <RefreshCw className="h-3 w-3 text-amber-500 animate-spin shrink-0" />
        </div>
      );
    } else if (selectedEmail) {
      return (
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-emerald-600 font-bold font-mono">Active</span>
          <div className="h-3.5 w-3.5 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-600 flex items-center justify-center text-[8px] font-extrabold font-mono shrink-0">✓</div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-slate-400 font-mono">Standby</span>
          <div className="h-1.5 w-1.5 rounded-full bg-slate-350 shrink-0 mr-1" />
        </div>
      );
    }
  };

  useEffect(() => {
    if (trustScore !== prevTrustScore) {
      const diff = trustScore - prevTrustScore;
      setDeltaScore(diff);
      setPrevTrustScore(trustScore);
    }
  }, [trustScore, prevTrustScore]);

  // Count unread sandboxed emails
  const unreadCount = emails.filter(e => e.status === 'unread').length;

  return (
    <aside className="w-68 flex-shrink-0 bg-slate-50 border-r border-slate-200 flex flex-col h-full font-sans">
      {/* Sidebar Logo */}
      <div className="p-4 flex items-center gap-3">
        <div className="h-8 w-8 flex items-center justify-center bg-white shadow-sm rounded-lg border border-slate-200">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4H20Z" fill="#EA4335" />
            <path d="M22 6V18C22 19.1 21.1 20 20 20H18V8L12 13L6 8V20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4H6L12 9L18 4H20C21.1 4 22 4.9 22 6Z" fill="#34A853" />
            <path d="M12 13L22 6V18C22 19.1 21.1 20 20 20H18V8L12 13Z" fill="#4285F4" />
            <path d="M12 13L2 6V18C2 19.1 2.9 20 4 20H6V8L12 13Z" fill="#FBBC05" />
          </svg>
        </div>
        <div>
          <h1 className="text-md font-bold text-slate-900 tracking-tight leading-none">AgentGym</h1>
          <span className="text-xs text-slate-500 font-medium">Mail Sandbox v3.5</span>
        </div>
      </div>

      {/* Trust Score Visual Widget */}
      <div className="px-4 mb-2">
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 h-12 w-12 bg-blue-50/50 rounded-full flex items-center justify-center translate-x-3 -translate-y-3">
            <Award className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            {showBriefPoints ? "Delta Points Updated" : "Inbox Trust Level"}
          </p>
          <div className="flex items-center justify-between mt-1 min-h-[36px]">
            <AnimatePresence mode="wait">
              {showBriefPoints ? (
                <motion.div
                  key="points-display"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-baseline gap-1"
                >
                  <span className="text-2xl font-bold font-mono tracking-tight text-blue-600">
                    {trustScore > 0 ? `+${trustScore.toFixed(0)}` : trustScore.toFixed(0)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium font-sans">pts</span>
                  {deltaScore !== null && (
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm ml-1.5 animate-bounce ${
                      deltaScore >= 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {deltaScore >= 0 ? `+${deltaScore}` : deltaScore}
                    </span>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="trust-display"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-baseline gap-1.5"
                >
                  <span className="text-2xl font-bold font-mono tracking-tight text-slate-800">
                    {Math.max(30, Math.min(100, 75 + trustScore * 0.25)).toFixed(0)}%
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold font-sans">TrustScore</span>
                  {(trustScore >= 50 || trustScore < 10) && (
                    <span className={`text-[8.5px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-sm ml-1 bg-slate-50 border ${
                      trustScore >= 50
                        ? 'text-emerald-700 border-emerald-200 bg-emerald-50/30'
                        : 'text-amber-700 border-amber-200 bg-amber-50/30'
                    }`}>
                      {trustScore >= 50 ? 'High' : 'Calibrating'}
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => setShowBriefPoints(prev => !prev)}
              title="Toggle view mode"
              className="text-[8px] font-black text-slate-500 hover:text-blue-700 hover:bg-blue-50/50 border border-slate-200 px-1.5 py-1 rounded-md transition cursor-pointer self-center whitespace-nowrap"
            >
              Toggle
            </button>
          </div>

          {/* Success gauge */}
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                trustScore >= 50
                  ? 'bg-emerald-500'
                  : trustScore >= 10
                  ? 'bg-blue-500'
                  : trustScore > -20
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.max(5, Math.min(100, ((trustScore + 60) / 160) * 100))}%` }}
            />
          </div>

          <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100">
            <span className="text-[10px] text-slate-500 font-medium">RL Training System</span>
            <button
              id="reset-gym-stats"
              onClick={onReset}
              className="text-[10px] flex items-center gap-1 text-slate-700 hover:text-red-600 border border-slate-200 hover:border-red-100 px-1.5 py-0.5 rounded-md bg-slate-50 transition"
            >
              <RefreshCw className="h-2.5 w-2.5" /> Reset Score
            </button>
          </div>
        </div>
      </div>

      {/* Gmail Sandbox Sync Card */}
      <div className="px-4 py-1.5">
        <div className="bg-slate-200/50 rounded-xl p-3 border border-slate-250 shadow-3xs">
          <p className="text-[9.5px] font-bold text-slate-450 uppercase tracking-wider mb-2">Gmail Sandbox Mirror</p>
          {gmailToken ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-slate-800 truncate block max-w-[150px]" title={activeGmailEmail || userEmail}>
                  {activeGmailEmail || userEmail}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Securely clone 100 emails at a time. No active writing back to live inbox.
              </p>
              <button
                onClick={onConnectGmail}
                disabled={isSyncingGmail}
                className="w-full bg-white hover:bg-slate-50 border border-slate-250 text-slate-700 text-[10px] font-bold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition shadow-3xs"
              >
                <RefreshCw className={`h-3 w-3 text-blue-600 ${isSyncingGmail ? 'animate-spin' : ''}`} />
                {isSyncingGmail ? 'Syncing...' : 'Sync Gmail Clone'}
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <p className="text-[9.5px] text-slate-500 leading-normal mb-2">
                Evaluate your AI agent's reinforcement learning strategies using 100 secure inbox clone emails.
              </p>
              <button
                onClick={onConnectGmail}
                disabled={isSyncingGmail}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-3 shadow-3xs cursor-pointer transition text-[11px] font-bold text-slate-700 active:bg-slate-100"
              >
                {isSyncingGmail ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 text-blue-600 animate-spin" />
                    <span>Cloning Sandbox...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                    <span>Clone Real Gmail</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Compose Button */}
      <div className="px-4 py-2">
        <button
          id="btn-fake-compose"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl shadow-xs hover:shadow-sm flex items-center justify-center gap-2 text-sm transition"
        >
          <Mail className="h-4 w-4" />
          Compose Draft
        </button>
      </div>

      {/* Scrollable Navigation and Logs Section */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-3 py-1 scrollbar-none" id="sidebar-scrollable-content">
        {/* Inbox Sub-navigation */}
        <nav className="px-2 space-y-0.5" id="sidebar-inbox-nav">
          {[
            { id: 'inbox', label: 'Inbox', icon: Mail, badge: unreadCount, badgeColor: 'bg-blue-100 text-blue-700' },
            { id: 'starred', label: 'Starred', icon: Star },
            { id: 'snoozed', label: 'Snoozed', icon: Clock },
            { id: 'sent', label: 'Sent', icon: Send },
            { id: 'drafts', label: 'Drafts', icon: File },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'pitch', label: 'The Pitch', icon: Presentation },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-800'
                    : 'text-slate-600 hover:bg-slate-150 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-mono font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Action history card */}
        <div className="mx-3 bg-white border border-slate-200/80 rounded-xl p-3 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_2px_5px_rgba(0,0,0,0.08)] transition-all animate-fade-in font-sans">
          {/* Title block */}
          <div className="flex items-center gap-2 text-slate-500 text-[10.5px] font-bold uppercase tracking-wider mb-2 pb-1.5 border-b border-slate-100">
            <ClipboardList className="h-3.5 w-3.5 text-slate-400" />
            <span>Managed Agents</span>
          </div>

          {/* Info text */}
          <p className="text-[10px] text-slate-500 mb-2.5 leading-relaxed">
            {selectedEmail 
              ? "Here are key actions taken for this email:" 
              : "Here are key actions taken for the app:"
            }
          </p>

          {/* List wrapper */}
          <div className="space-y-3">
            {selectedEmail ? (
              selectedEmail.complexity === 'high' ? (
                <>
                  {/* Agent Group */}
                  <div>
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px] mb-1.5">
                      <Pencil className="h-3 w-3 text-slate-400" />
                      <span>Coordinated 3 sub-agents</span>
                    </div>
                    <div className="pl-4.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-600">
                        <span>Context Gatherer</span>
                        {renderAgentStatus(1)}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-600">
                        <span>Tool User Agent</span>
                        {renderAgentStatus(2)}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-600">
                        <span>Drafting Agent</span>
                        {renderAgentStatus(3)}
                      </div>
                    </div>
                  </div>

                  {/* Tool / Build Group */}
                  <div className="flex items-center justify-between text-slate-700 font-bold text-[11px] pt-1.5 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Wrench className="h-3 w-3 text-slate-400" />
                      <span>Sandboxed Engine Ready</span>
                    </div>
                    {renderEngineStatus()}
                  </div>
                </>
              ) : (
                <>
                  {/* Direct Triage Group */}
                  <div>
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px] mb-1.5">
                      <Pencil className="h-3 w-3 text-slate-400" />
                      <span>Autonomous General Triage</span>
                    </div>
                    <div className="pl-4.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-600">
                        <span>Main Agent direct dispatch</span>
                        {renderAgentStatus(1)}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-600">
                        <span>Draft option formulation</span>
                        {renderAgentStatus(2)}
                      </div>
                    </div>
                  </div>

                  {/* Sandbox Idle Group */}
                  <div className="flex items-center justify-between text-slate-600 font-bold text-[11px] pt-1.5 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Wrench className="h-3 w-3 text-slate-400" />
                      <span>Sandbox Engine Status</span>
                    </div>
                    {renderEngineStatus()}
                  </div>
                </>
              )
            ) : (
              <>
                {/* Default Offline Triage Group */}
                <div>
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px] mb-1.5">
                    <Pencil className="h-3 w-3 text-slate-400" />
                    <span>Sandbox Gym Evaluator</span>
                  </div>
                  <div className="pl-4.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Select active gym email</span>
                      <span className="text-[8px] font-mono text-slate-400">Waiting</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-slate-500 font-bold text-[11px] pt-1.5 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Wrench className="h-3 w-3 text-slate-350" />
                    <span>Sandbox Engine Status</span>
                  </div>
                  {renderEngineStatus()}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
