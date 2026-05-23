import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  ArrowRight, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  Video, 
  Cpu, 
  Activity, 
  CheckCircle, 
  Download, 
  Target, 
  Flame, 
  Zap, 
  Wand2 
} from 'lucide-react';

interface PitchDeckProps {
  onStartTraining: () => void;
}

export default function PitchDeck({ onStartTraining }: PitchDeckProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 'welcome',
      title: 'AgentGym',
      tagline: 'Inbox Alignment via Reinforcement Feedback',
      subtitle: 'Aligning autonomous mail sub-agents inside a safe simulation sandbox.',
      icon: <Sparkles className="h-10 w-10 text-blue-400 animate-pulse" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center text-left mt-4">
          {/* Bullet points panel */}
          <div className="md:col-span-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400 font-extrabold text-[11px] shrink-0 mt-0.5">1</div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">Middleware Playground</h4>
                  <p className="text-[11.5px] text-slate-400">Safely sandboxes your autonomous sub-agents before live deployment.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400 font-extrabold text-[11px] shrink-0 mt-0.5">2</div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">Tame Rogue AI Autopilots</h4>
                  <p className="text-[11.5px] text-slate-400">Overcomes rogue calendar replies and overlooked payment failures.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400 font-extrabold text-[11px] shrink-0 mt-0.5">3</div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">Micro-Calibration Controls</h4>
                  <p className="text-[11.5px] text-slate-400">Zero-friction head movements, gesture swipes, or live speech teaching.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Core Interactive Sandbox schematic */}
          <div className="md:col-span-6 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center h-52 relative overflow-hidden">
            <div className="absolute top-2 left-2 text-[8px] font-mono text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-900/40 uppercase tracking-widest">
              Live Alignment Matrix
            </div>

            {/* Pulsing visual grid with orbiting nodes */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 border border-dashed border-blue-500/20 rounded-full animate-spin-slow"></div>
              <div className="absolute w-20 h-20 border border-dashed border-sky-500/30 rounded-full animate-pulse"></div>
              
              {/* Central Core Agent Node */}
              <div className="relative z-10 w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Cpu className="h-5 w-5 text-white animate-pulse" />
              </div>

              {/* Orbiting particles mapping input weights */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 w-2.5 h-2.5 bg-emerald-400 rounded-full shadow shadow-emerald-400/50 animate-bounce"></div>
              <div className="absolute bottom-1 right-2 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
              <div className="absolute left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-indigo-400 rounded-full animate-pulse"></div>
            </div>

            <span className="text-[10px] text-slate-400 font-medium tracking-tight mt-3 text-center">
              Reinforcement Tuning Loops 
              <span className="text-emerald-400 font-bold ml-1">● 98.4% Aligned</span>
            </span>
          </div>
        </div>
      )
    },
    {
      id: 'problem',
      title: 'The Problem',
      tagline: 'Rogue Mail Agents & Deficient Automation',
      subtitle: 'Classic LLM shortcuts lead to severe personal and operational friction.',
      icon: <AlertTriangle className="h-10 w-10 text-rose-400 animate-bounce-slow" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center text-left mt-4">
          {/* Bullet points panel */}
          <div className="md:col-span-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-rose-500/15 flex items-center justify-center text-rose-400 font-extrabold text-[11px] shrink-0 mt-0.5">&times;</div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">Cold Family Autoreplies</h4>
                  <p className="text-[11.5px] text-slate-400">AI auto-schedules calendar links to partners rather than warm custom text.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-rose-500/15 flex items-center justify-center text-rose-400 font-extrabold text-[11px] shrink-0 mt-0.5">&times;</div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">Database Outage Archiving</h4>
                  <p className="text-[11.5px] text-slate-400">Classifies critical database alerts as routine newsletter updates.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-rose-500/15 flex items-center justify-center text-rose-400 font-extrabold text-[11px] shrink-0 mt-0.5">&times;</div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">Blind Solicitation Snare</h4>
                  <p className="text-[11.5px] text-slate-400">Spams recruiters with calendar slots instead of dynamic unsubscribes.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Problem Warning Monitor Widget */}
          <div className="md:col-span-6 bg-slate-900/60 p-4 rounded-2xl border border-rose-950/40 flex flex-col items-center justify-center h-52 relative overflow-hidden">
            <div className="absolute top-2 left-2 text-[8px] font-mono text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/40 uppercase tracking-widest animate-pulse">
              System Disturbance Alerts
            </div>

            <div className="w-full space-y-2.5 px-3">
              <div className="bg-rose-950/30 border border-rose-900/35 p-2 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-[10px] font-mono text-rose-300 font-bold uppercase">Severe Action Leakage</span>
                </div>
                <span className="text-[9px] font-mono text-slate-500">Failed auto-draft</span>
              </div>

              <div className="relative p-2.5 rounded-xl bg-slate-950 border border-slate-850 space-y-1">
                <div className="flex justify-between text-[9px] font-mono">
                  <span className="text-slate-500">From: brenda@vancestates.com</span>
                  <span className="text-rose-400">Rogue Action</span>
                </div>
                <div className="h-1.5 w-full bg-rose-520/20 bg-rose-950/50 rounded overflow-hidden">
                  <div className="bg-rose-500 h-full w-4/5 animate-pulse" />
                </div>
                <span className="text-[8.5px] font-sans text-slate-400 block truncate">"Drafted: Confirm tour with realtor on Saturday at 2 PM..."</span>
              </div>
            </div>

            <span className="text-[10px] text-rose-400 mt-3 font-semibold flex items-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5 animate-bounce" />
              Agent misfires occurring on unaligned models
            </span>
          </div>
        </div>
      )
    },
    {
      id: 'solution',
      title: 'The Interaction',
      tagline: 'Multi-Modal Gym Controls',
      subtitle: 'Zero-friction validation designed for human-in-the-loop loops.',
      icon: <Video className="h-10 w-10 text-emerald-400 animate-pulse" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center text-left mt-4">
          {/* Bullet points panel */}
          <div className="md:col-span-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 font-extrabold text-[11px] shrink-0 mt-0.5">L</div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">Tilt Head Left (Approve)</h4>
                  <p className="text-[11.5px] text-slate-400">Confirm positive active checks (Unsubscribe/Action) instantly.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 font-extrabold text-[11px] shrink-0 mt-0.5">R</div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">Tilt Head Right (Decline/Snooze)</h4>
                  <p className="text-[11.5px] text-slate-400">Reject incorrect sub-agent drafts and snooze notifications.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 font-extrabold text-[11px] shrink-0 mt-0.5">🎙️</div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">Continuous Voice Feedback</h4>
                  <p className="text-[11.5px] text-slate-400">Speak instructions clearly to filter future bulk spams.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Webcam Target schematic */}
          <div className="md:col-span-6 bg-slate-900/60 p-4 rounded-2xl border border-emerald-950/40 flex flex-col items-center justify-center h-52 relative overflow-hidden">
            <div className="absolute top-2 left-2 text-[8px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40 uppercase tracking-widest">
              Physical Alignment Calibration
            </div>

            {/* Simulated camera grid screen */}
            <div className="w-40 h-28 border border-white/10 rounded-xl relative overflow-hidden bg-slate-950 flex flex-col items-center justify-between p-2">
              <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] bg-[size:10px_10px] opacity-10" />
              
              {/* Scanline */}
              <div className="absolute w-full h-0.5 bg-emerald-500/30 top-1/2 -translate-y-1/2 animate-pulse" />

              <span className="text-[7px] font-mono text-emerald-500 self-start select-none">WEBCAM_TRACKER // ACTIVE</span>

              {/* Dynamic head-tilt graphic */}
              <div className="relative py-1 flex flex-col items-center animate-bounce-slow">
                <div className="h-9 w-9 border-2 border-emerald-500/40 border-dashed rounded-full flex items-center justify-center">
                  <div className="h-5 w-5 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-full animate-pulse" />
                </div>
                {/* Horizontal scale indicators */}
                <div className="w-16 h-1 bg-slate-800 rounded-full mt-2 relative overflow-hidden">
                  <div className="bg-yellow-400 h-full w-2 absolute left-1/3 animate-ping" />
                </div>
              </div>

              <div className="w-full flex justify-between text-[6.5px] font-mono text-slate-500">
                <span>[A] APPROVE</span>
                <span className="text-emerald-400">CENTERED</span>
                <span>SNOOZE [D]</span>
              </div>
            </div>

            <span className="text-[10px] text-slate-400 font-semibold mt-3 text-center">
              Real-time facial vector mapping validation
            </span>
          </div>
        </div>
      )
    },
    {
      id: 'features',
      title: 'Under the Hood',
      tagline: 'Continuous Autopilot & Exporter',
      subtitle: 'A fully synchronized full-stack suite powered by modern Gemini APIs.',
      icon: <Cpu className="h-10 w-10 text-purple-400" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center text-left mt-4">
          {/* Bullet points panel */}
          <div className="md:col-span-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-purple-500/15 flex items-center justify-center text-purple-400 font-extrabold text-[11px] shrink-0 mt-0.5">●</div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">Crawler Autopilot Dials</h4>
                  <p className="text-[11.5px] text-slate-400">Simulate incoming workflows at customized crawlers speeds.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-purple-500/15 flex items-center justify-center text-purple-400 font-extrabold text-[11px] shrink-0 mt-0.5">●</div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">Continuous Voice Learning</h4>
                  <p className="text-[11.5px] text-slate-400">Gemini models translate voice comments directly into schema overrides.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-purple-500/15 flex items-center justify-center text-purple-400 font-extrabold text-[11px] shrink-0 mt-0.5">●</div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">Production Manifest Exporter</h4>
                  <p className="text-[11.5px] text-slate-400">Export learned weights once Trust Score surpasses threshold.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Code Exporter schematic animation */}
          <div className="md:col-span-6 bg-slate-900/60 p-4 rounded-2xl border border-purple-950/40 flex flex-col items-center justify-center h-52 relative overflow-hidden">
            <div className="absolute top-2 left-2 text-[8px] font-mono text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-900/40 uppercase tracking-widest">
              Manifest Exporter CLI
            </div>

            {/* Mock Scrolling Terminal and stats */}
            <div className="w-full bg-slate-950 px-3 py-2 border border-slate-850 rounded-xl space-y-1.5 text-left font-mono text-[9px]">
              <div className="flex items-center justify-between border-b border-slate-900 pb-1 text-slate-500">
                <span>Output Log Terminal</span>
                <span className="text-purple-400">Active</span>
              </div>
              <p className="text-slate-450 text-slate-400 font-medium leading-normal">
                <span className="text-slate-500 font-mono">$</span> npx agentgym validate --export <br />
                <span className="text-emerald-400 animate-pulse">// Compiling dynamic policies...</span> <br />
                <span className="text-purple-400">&gt; Exported 11 aligned inbox filters.</span> <br />
                <span className="text-emerald-400 font-bold">&gt;&gt; trust_score: +45 // STATUS: VALID</span>
              </p>
            </div>

            <div className="w-full mt-2 bg-slate-950/50 p-1.5 rounded-lg border border-slate-800/80 flex justify-between items-center text-[8.5px] font-mono">
              <span className="text-slate-400">Manifest:</span>
              <span className="text-white font-semibold">gym_manifest_v1.json</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'demo',
      title: 'Ready to Train?',
      tagline: 'Step Inside the Sandbox Room',
      subtitle: 'Try calibration trackers, add emails, and deploy safe sub-agents now.',
      icon: <Target className="h-10 w-10 text-yellow-400 animate-bounce-slow" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center text-left mt-4">
          {/* Bullet points panel */}
          <div className="md:col-span-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-yellow-500/15 flex items-center justify-center text-yellow-500 font-extrabold text-[12px] shrink-0 mt-0.5">✓</div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">Gain AI Trust Points</h4>
                  <p className="text-[11.5px] text-slate-400">Audit sub-agent mistakes dynamically as real reinforcement signals.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-yellow-500/15 flex items-center justify-center text-yellow-500 font-extrabold text-[12px] shrink-0 mt-0.5">✓</div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">Learn Voice Filter Policies</h4>
                  <p className="text-[11.5px] text-slate-400">Say what you want and listen to Gemini confirm your preferences.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-yellow-500/15 flex items-center justify-center text-yellow-500 font-extrabold text-[12px] shrink-0 mt-0.5">✓</div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">Deploy Aligned Sub-Agents</h4>
                  <p className="text-[11.5px] text-slate-400">Secure automated mail handlers operating with custom constraints.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sandbox Room CTA Launchpad Panel */}
          <div className="md:col-span-6 bg-slate-900/60 p-5 rounded-2xl border border-yellow-950/40 flex flex-col items-center justify-center h-52 relative overflow-hidden text-center space-y-3">
            <div className="absolute top-2 left-2 text-[8px] font-mono text-yellow-400 bg-yellow-950/40 px-2 py-0.5 rounded border border-yellow-900/40 uppercase tracking-widest">
              Ready for Sandbox Deploy
            </div>

            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur-sm opacity-55 animate-pulse" />
              <button
                onClick={onStartTraining}
                className="relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-xl shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <CheckCircle className="h-4 w-4" /> Start Active Gym Training
              </button>
            </div>

            <p className="text-[10px] text-slate-400 leading-normal max-w-xs">
              Supports continuous calibration, simulated email crawls, and Gemini TTS feedback loops!
            </p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const slide = slides[currentSlide];

  return (
    <div className="flex-grow bg-slate-950 p-6 flex flex-col justify-between h-full text-white font-sans relative overflow-hidden select-none">
      
      {/* Dynamic Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />

      {/* Slide Deck Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
            <Sparkles className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 font-mono">Demo Presentation Deck</span>
            <p className="text-xs font-bold text-slate-300">AgentGym Alignment Suite</p>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Slide <span className="text-white font-bold">{currentSlide + 1}</span> of <span className="text-slate-500">{slides.length}</span>
        </div>
      </div>

      {/* Main Slide Workspace Container */}
      <div className="relative z-10 my-auto py-6 flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="w-full text-center space-y-4 max-w-2xl px-4"
          >
            <div className="mx-auto h-16 w-16 bg-slate-900/60 rounded-full border border-slate-800 flex items-center justify-center mb-1">
              {slide.icon}
            </div>

            <span className="text-xs font-bold font-mono uppercase tracking-widest text-blue-400">
              {slide.tagline}
            </span>

            <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-white leading-tight">
              {slide.title}
            </h2>

            <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
              {slide.subtitle}
            </p>

            <div className="pt-4">
              {slide.content}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation Bar */}
      <div className="relative z-10 border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Navigation tips */}
        <div className="text-[10.5px] text-slate-500 flex items-center gap-2 font-mono">
          <span>Keyboard:</span>
          <span className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-bold">&larr;</span>
          <span>Previous</span>
          <span className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-bold">&rarr;</span>
          <span>Next</span>
        </div>

        {/* Slide Dots Navigator */}
        <div className="flex gap-2.5">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'w-6 bg-blue-500' : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
              title={s.title}
            />
          ))}
        </div>

        {/* Action Arrows */}
        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className={`p-2.5 rounded-xl border transition ${
              currentSlide === 0 
                ? 'border-slate-850 text-slate-700 bg-slate-950/40 cursor-not-allowed' 
                : 'border-slate-800 hover:border-slate-600 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          
          {currentSlide === slides.length - 1 ? (
            <button
              onClick={onStartTraining}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-xs transition"
            >
              Start Training
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="p-2.5 rounded-xl border border-slate-800 hover:border-slate-600 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 transition"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
