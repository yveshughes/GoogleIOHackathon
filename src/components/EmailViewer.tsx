import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

  // Selection feedback state
  const [showFeedback, setShowFeedback] = useState<{
    option: 'option1' | 'option2';
    pts: number;
    isCorrect: boolean;
  } | null>(null);

  // Dictation states
  const [isDictating, setIsDictating] = useState<boolean>(false);
  const [dictatedText, setDictatedText] = useState<string>('');
  const [isProcessingDictation, setIsProcessingDictation] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);

  // Reset feedback state on email change
  useEffect(() => {
    setShowFeedback(null);
    setDictatedText('');
  }, [email?.id]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        const text = finalTranscript || interimTranscript;
        setDictatedText(text);
      };

      rec.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const processDictation = async (text: string) => {
    if (!text.trim() || !email) return;

    setIsProcessingDictation(true);
    try {
      console.log("Sending voice feedback to Gemini aligner:", text);
      const response = await fetch("/api/gemini/learn-from-voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          voiceFeedback: text
        })
      });

      if (!response.ok) {
        throw new Error(`Voice feedback request failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Gemini voice aligner response:", data);

      if (data.newRule && data.proposedActions) {
        // 1. Update rule manager lists and UI options
        onVoiceFeedbackAligned(data.newRule, data.proposedActions);

        // 2. Trigger Option 2 success feedback animation (+15 pts)
        setShowFeedback({
          option: 'option2',
          pts: 15,
          isCorrect: true
        });

        // 3. Pause 1800ms to allow user to read the new description and see the +15 pts bubble before advancing
        setTimeout(() => {
          onResolveDischarge('option2');
          setShowFeedback(null);
        }, 1800);
      }
    } catch (err: any) {
      console.error("Error processing voice dictation feedback:", err);
    } finally {
      setIsProcessingDictation(false);
      setDictatedText('');
    }
  };

  // Keyboard listener for Fn and V keys push-to-talk
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isTriggerKey = e.key === 'Fn' || e.code === 'Fn' || e.key.toLowerCase() === 'v';

      if (
        !isTriggerKey ||
        isDictating ||
        isProcessingDictation ||
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      e.preventDefault();
      setIsDictating(true);
      setDictatedText('');

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.warn("Failed to start speech recognition:", err);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const isTriggerKey = e.key === 'Fn' || e.code === 'Fn' || e.key.toLowerCase() === 'v';

      if (!isTriggerKey || !isDictating) {
        return;
      }

      e.preventDefault();
      setIsDictating(false);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.warn("Failed to stop speech recognition:", err);
        }
      }

      const transcriptToSend = dictatedText.trim();
      if (transcriptToSend) {
        processDictation(transcriptToSend);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isDictating, isProcessingDictation, dictatedText, email]);

  const handleCardClick = (optionChosen: 'option1' | 'option2') => {
    if (!email || !proposedActions || showFeedback || isDictating || isProcessingDictation) return;

    const isCorrect = proposedActions.recommendation === optionChosen;
    const basePoints = email.points || 10;
    const pts = isCorrect ? basePoints : -Math.round(basePoints * 0.4);

    setShowFeedback({
      option: optionChosen,
      pts,
      isCorrect
    });

    setTimeout(() => {
      onResolveDischarge(optionChosen);
      setShowFeedback(null);
    }, 900);
  };

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
      handleCardClick(activeHoldDirection === 'left' ? 'option1' : 'option2');
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
            {/* Options cards row */}
            <div className="grid grid-cols-2 gap-6">
              {/* Option 1 Option Card */}
              <div
                onClick={() => handleCardClick('option1')}
                className={`relative bg-white rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer select-none flex flex-col justify-start min-h-[165px] group shadow-xs hover:shadow-md ${
                  showFeedback
                    ? showFeedback.option === 'option1'
                      ? showFeedback.isCorrect
                        ? 'border-emerald-500 bg-emerald-50/20 ring-4 ring-emerald-500/20 scale-[0.98]'
                        : 'border-rose-500 bg-rose-50/20 ring-4 ring-rose-500/20 scale-[0.98]'
                      : 'opacity-40 scale-[0.97] blur-[0.5px]'
                    : (isDictating || isProcessingDictation)
                    ? 'opacity-40 scale-[0.97] blur-[0.5px]'
                    : activeHoldDirection === 'left'
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

                <AnimatePresence>
                  {showFeedback && showFeedback.option === 'option1' && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.8, x: '-50%' }}
                      animate={{ opacity: 1, y: -50, scale: 1.15, x: '-50%' }}
                      exit={{ opacity: 0, y: -70, scale: 0.95, x: '-50%' }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={`absolute top-1/2 left-1/2 px-5 py-2 rounded-full font-bold text-lg shadow-lg pointer-events-none z-30 flex items-center gap-1 border ${
                        showFeedback.isCorrect
                          ? 'bg-emerald-600 border-emerald-400 text-white'
                          : 'bg-rose-600 border-rose-400 text-white'
                      }`}
                    >
                      {showFeedback.isCorrect ? `+${showFeedback.pts} pts` : `${showFeedback.pts} pts`}
                    </motion.div>
                  )}
                </AnimatePresence>

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
                onClick={() => handleCardClick('option2')}
                className={`relative bg-white rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer select-none flex flex-col justify-start min-h-[165px] group shadow-xs hover:shadow-md ${
                  showFeedback
                    ? showFeedback.option === 'option2'
                      ? showFeedback.isCorrect
                        ? 'border-emerald-500 bg-emerald-50/20 ring-4 ring-emerald-500/20 scale-[0.98]'
                        : 'border-rose-500 bg-rose-50/20 ring-4 ring-rose-500/20 scale-[0.98]'
                      : 'opacity-40 scale-[0.97] blur-[0.5px]'
                    : isDictating
                    ? 'border-indigo-500 bg-indigo-50/30 scale-[1.01] ring-4 ring-indigo-500/20'
                    : isProcessingDictation
                    ? 'border-amber-400 bg-amber-50/20 scale-[0.99] opacity-90'
                    : activeHoldDirection === 'right'
                    ? 'border-indigo-600 ring-4 ring-indigo-500/25 bg-slow-50/20 transform scale-[1.02]'
                    : proposedActions.recommendation === 'option2'
                    ? 'border-indigo-400 bg-indigo-50/5 hover:border-indigo-600'
                    : 'border-slate-200 hover:border-slate-400'
                }`}
              >
                {proposedActions.recommendation === 'option2' && !isDictating && !isProcessingDictation && (
                  <span className="absolute -top-3.5 left-5 bg-indigo-600 text-white text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-widest shadow-md">
                    ★ AI Recommended
                  </span>
                )}

                <AnimatePresence>
                  {showFeedback && showFeedback.option === 'option2' && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.8, x: '-50%' }}
                      animate={{ opacity: 1, y: -50, scale: 1.15, x: '-50%' }}
                      exit={{ opacity: 0, y: -70, scale: 0.95, x: '-50%' }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={`absolute top-1/2 left-1/2 px-5 py-2 rounded-full font-bold text-lg shadow-lg pointer-events-none z-30 flex items-center gap-1 border ${
                        showFeedback.isCorrect
                          ? 'bg-emerald-600 border-emerald-400 text-white'
                          : 'bg-rose-600 border-rose-400 text-white'
                      }`}
                    >
                      {showFeedback.isCorrect ? `+${showFeedback.pts} pts` : `${showFeedback.pts} pts`}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-xs uppercase font-extrabold text-slate-400 tracking-widest block">
                      {isDictating 
                        ? 'Option 2 (🔴 Recording...)' 
                        : isProcessingDictation 
                        ? 'Option 2 (Voice Processing...)' 
                        : 'Option 2'}
                    </span>
                    {activeHoldDirection === 'right' && !isDictating && !isProcessingDictation && (
                      <span className="text-xs font-black text-indigo-600 animate-pulse bg-indigo-100 px-2 py-0.5 rounded">
                        HOLDING {3 - secondsHeld}s...
                      </span>
                    )}
                  </div>

                  <h4 className="text-base md:text-lg lg:text-xl font-black text-slate-950 tracking-tight leading-snug group-hover:text-indigo-600 transition-colors">
                    {isDictating
                      ? (dictatedText || "Dictating correction... (Speak now)")
                      : isProcessingDictation
                      ? (dictatedText || "Analyzing spoken guidelines...")
                      : proposedActions.option2.actionText}
                  </h4>

                  {isDictating ? (
                    <div className="flex items-center gap-1 mt-4 h-6 animate-pulse">
                      <div className="w-1 bg-indigo-500 rounded-full animate-bar-1" />
                      <div className="w-1 bg-indigo-400 rounded-full animate-bar-2" />
                      <div className="w-1 bg-indigo-650 bg-indigo-600 rounded-full animate-bar-3" />
                      <div className="w-1 bg-indigo-500 rounded-full animate-bar-4" />
                    </div>
                  ) : isProcessingDictation ? (
                    <div className="mt-3.5 text-xs md:text-sm text-amber-700 bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-xl italic leading-relaxed animate-pulse">
                      Gemini is aligning the agent policy and updating options...
                    </div>
                  ) : proposedActions.option2.draft ? (
                    <div className="mt-3.5 text-xs md:text-sm text-slate-700 bg-slate-50 border-l-4 border-indigo-500 p-3 rounded-r-xl italic font-serif leading-relaxed line-clamp-3">
                      &ldquo;{proposedActions.option2.draft}&rdquo;
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Pro Tip voice instruction line */}
            <div className="text-[10px] text-slate-400 font-medium text-center select-none py-1">
              Press and hold <span className="bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold text-[9px] border border-slate-300">Fn</span> (or <span className="bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold text-[9px] border border-slate-300">V</span>) to dictate a custom policy correction directly into Option 2
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
