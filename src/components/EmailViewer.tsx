import React, { useState, useEffect } from 'react';
import { Archive, Trash, MailOpen, AlertCircle, Activity, Sparkles, ArrowLeftRight, Wrench, Search, Layers, UserCheck } from 'lucide-react';
import { Email, ProposedActions, PolicyRule } from '../types';

interface EmailViewerProps {
  email: Email | null;
  proposedActions: ProposedActions | null;
  isGeneratingOptions: boolean;
  gestureMode: 'center' | 'left' | 'right';
  onResolveDischarge: (action: 'option1' | 'option2') => void;
  trustScore: number;
  onVoiceFeedbackAligned: (newRule: PolicyRule, updatedActions: ProposedActions) => void;
}

export default function EmailViewer({
  email,
  proposedActions,
  isGeneratingOptions,
  gestureMode,
  onResolveDischarge,
  trustScore,
  onVoiceFeedbackAligned
}: EmailViewerProps) {
  // Timer state for gesture hold locking
  const [secondsHeld, setSecondsHeld] = useState<number>(0);
  const [activeHoldDirection, setActiveHoldDirection] = useState<'left' | 'right' | null>(null);

  // Gesture locking logic
  useEffect(() => {
    if (gestureMode === 'left') {
      setActiveHoldDirection('left');
      setSecondsHeld(1);
    } else if (gestureMode === 'right') {
      setActiveHoldDirection('right');
      setSecondsHeld(1);
    } else {
      setActiveHoldDirection(null);
      setSecondsHeld(0);
    }
  }, [gestureMode]);

  // Hold position timer effect
  useEffect(() => {
    let timer: any;
    if (activeHoldDirection && secondsHeld > 0 && secondsHeld < 3) {
      timer = setTimeout(() => {
        setSecondsHeld(prev => prev + 1);
      }, 700);
    } else if (activeHoldDirection && secondsHeld === 3) {
      // Trigger decision!
      onResolveDischarge(activeHoldDirection === 'left' ? 'option1' : 'option2');
      setActiveHoldDirection(null);
      setSecondsHeld(0);
    }
    return () => clearTimeout(timer);
  }, [secondsHeld, activeHoldDirection]);

  if (!email) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 font-sans h-full bg-slate-50">
        <div className="max-w-xs text-center">
          <ArrowLeftRight className="h-12 w-12 text-slate-300 mx-auto mb-3.5 animate-bounce-slow" />
          <p className="font-semibold text-slate-650 text-sm">Select Email to Start Active Gym Training</p>
          <p className="text-xs text-slate-450 mt-1.5 leading-relaxed">
            Choose an email from the list. We'll deploy your sub-agent to formulate custom resolution strategies.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 font-sans overflow-y-auto" id="email-detail-workspace">
      {/* Gmail-style toolbar actions */}
      <div className="px-6 py-2 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition" title="Archive">
            <Archive className="h-4 w-4" />
          </button>
          <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition" title="Delete">
            <Trash className="h-4 w-4" />
          </button>
          <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition" title="Mark Unread">
            <MailOpen className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-mono">Sandbox ID: MOCK-INBOX-SECURE-{email.id}</span>
        </div>
      </div>

      {/* Main Mail content */}
      <div className="p-6 bg-white border-b border-slate-200 shadow-2xs">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div>
            <h2 id="email-detail-subject" className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
              {email.subject}
            </h2>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-xs text-slate-600 font-semibold">{email.sender}</span>
              <span className="text-xs text-slate-400">&lt;{email.senderEmail}&gt;</span>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-mono font-medium">{email.date}</span>
        </div>

        {/* Previous Catastrophic Error Box */}
        <div className="bg-rose-50 border border-rose-200/60 rounded-xl p-3 mb-5 flex gap-2.5 items-start">
          <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-rose-800 uppercase tracking-wider text-[10px]">Previous Deficient Automator Action</p>
            <p className="text-rose-700 font-medium mt-0.5">{email.previousFailedAction}</p>
          </div>
        </div>

        {/* Email Body */}
        <div id="email-detail-body" className="text-slate-700 text-xs leading-relaxed whitespace-pre-wrap pb-2 border-b border-slate-100">
          {email.body}
        </div>
      </div>

      {/* Active reinforcement agent decision block */}
      <div className="p-6 flex-1 flex flex-col justify-end">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">AI Gym Agent proposed resolutions</h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded-sm select-none">
            <Activity className="h-3 w-3 text-blue-500 animate-pulse" />
            <span>Active Inference with Gemini 3.5 Flash</span>
          </div>
        </div>

        {/* AI Options Box rendering states */}
        {isGeneratingOptions ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center shadow-xs">
            <div className="relative mb-3 flex items-center justify-center">
              <div className="absolute h-10 w-10 bg-blue-500/10 rounded-full animate-ping" />
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Sparkles className="h-4 w-4 animate-spin-slow" />
              </div>
            </div>
            <p className="text-xs font-bold text-slate-700">Synthesizing Decision Branches...</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Gemini is formulating safe option proposals based on active custom policy constraints</p>
          </div>
        ) : proposedActions ? (
          <div className="space-y-4 animate-fade-in">
            {proposedActions.isSimulated && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-amber-900 shadow-2xs select-none">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-[10px] sm:text-xs">
                  <span className="font-extrabold text-amber-950">Local Sandbox Aligner Engagement:</span> We've dynamically engaged local sandboxed representations. Move your head or click directly to play inside this sandbox.
                </div>
              </div>
            )}

            {/* Options cards row */}
            <div className="grid grid-cols-2 gap-6">
              {/* Option 1 Option Card */}
              <div
                onClick={() => onResolveDischarge('option1')}
                className={`relative bg-white rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer select-none flex flex-col justify-start min-h-[165px] group shadow-xs hover:shadow-md ${
                  activeHoldDirection === 'left'
                    ? 'border-blue-600 ring-4 ring-blue-500/25 bg-blue-50/20 transform scale-[1.02]'
                    : proposedActions.recommendation === 'option1'
                    ? 'border-blue-400 bg-blue-50/5 hover:border-blue-600'
                    : 'border-slate-200 hover:border-slate-400'
                }`}
              >
                {proposedActions.recommendation === 'option1' && (
                  <span className="absolute -top-3.5 left-5 bg-blue-600 text-white text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-widest shadow-md">
                    ★ AI Recommended
                  </span>
                )}

                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-xs uppercase font-extrabold text-slate-400 tracking-widest block">
                      Option 1
                    </span>
                    {activeHoldDirection === 'left' && (
                      <span className="text-xs font-black text-blue-600 animate-pulse bg-blue-100 px-2 py-0.5 rounded">
                        HOLDING {3 - secondsHeld}s...
                      </span>
                    )}
                  </div>

                  <h4 className="text-base md:text-lg lg:text-xl font-black text-slate-950 tracking-tight leading-snug group-hover:text-blue-600 transition-colors">
                    {proposedActions.option1.actionText}
                  </h4>

                  {proposedActions.option1.draft && (
                    <div className="mt-3.5 text-xs md:text-sm text-slate-700 bg-slate-50 border-l-4 border-blue-500 p-3 rounded-r-xl italic font-serif leading-relaxed line-clamp-3">
                      &ldquo;{proposedActions.option1.draft}&rdquo;
                    </div>
                  )}
                </div>
              </div>

              {/* Option 2 Option Card */}
              <div
                onClick={() => onResolveDischarge('option2')}
                className={`relative bg-white rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer select-none flex flex-col justify-start min-h-[165px] group shadow-xs hover:shadow-md ${
                  activeHoldDirection === 'right'
                    ? 'border-indigo-600 ring-4 ring-indigo-500/25 bg-slow-50/20 transform scale-[1.02]'
                    : proposedActions.recommendation === 'option2'
                    ? 'border-indigo-400 bg-indigo-50/5 hover:border-indigo-600'
                    : 'border-slate-200 hover:border-slate-400'
                }`}
              >
                {proposedActions.recommendation === 'option2' && (
                  <span className="absolute -top-3.5 left-5 bg-indigo-600 text-white text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-widest shadow-md">
                    ★ AI Recommended
                  </span>
                )}

                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-xs uppercase font-extrabold text-slate-400 tracking-widest block">
                      Option 2
                    </span>
                    {activeHoldDirection === 'right' && (
                      <span className="text-xs font-black text-indigo-600 animate-pulse bg-indigo-100 px-2 py-0.5 rounded">
                        HOLDING {3 - secondsHeld}s...
                      </span>
                    )}
                  </div>

                  <h4 className="text-base md:text-lg lg:text-xl font-black text-slate-950 tracking-tight leading-snug group-hover:text-indigo-600 transition-colors">
                    {proposedActions.option2.actionText}
                  </h4>

                  {proposedActions.option2.draft && (
                    <div className="mt-3.5 text-xs md:text-sm text-slate-700 bg-slate-50 border-l-4 border-indigo-500 p-3 rounded-r-xl italic font-serif leading-relaxed line-clamp-3">
                      &ldquo;{proposedActions.option2.draft}&rdquo;
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Justification Text bar */}
            <div className="bg-blue-50/50 rounded-xl p-3.5 border border-blue-100 flex gap-2.5 items-start">
              <Activity className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-750">
                <span className="font-bold text-blue-900 tracking-tight">Agent Justification: </span>
                <span>{proposedActions.justification}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-100 rounded-xl border border-slate-200 p-6 text-center text-slate-500 text-xs">
            Failed to formulate options automatically. Please trigger dynamic generation manually.
          </div>
        )}
      </div>
    </div>
  );
}
