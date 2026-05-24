import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Download, 
  Activity, 
  Target, 
  Video, 
  Cpu, 
  Zap, 
  ShieldAlert, 
  CheckCircle 
} from 'lucide-react';

interface PitchDeckProps {
  onStartTraining: () => void;
}

interface BulletItem {
  label?: string;
  text: string;
  subBullets?: string[];
}

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  bullets: BulletItem[];
}

export default function PitchDeck({ onStartTraining }: PitchDeckProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      id: 'welcome',
      title: 'The Inbox Gym',
      subtitle: 'Training Trustworthy Agents via Physical Feedback',
      icon: <Sparkles className="h-10 w-10 text-blue-400" />,
      color: 'from-blue-400 via-indigo-200 to-sky-400',
      bullets: [
        { label: 'The Problem', text: 'We don’t trust agents to speak for us.' },
        { label: 'The Solution', text: 'A Reinforcement Learning (RL) environment to "train" your agent.' },
        { label: 'Powered by', text: 'Gemini 3.5 Flash + Managed Agents.' }
      ]
    },
    {
      id: 'concept',
      title: 'Clone Your Inbox',
      subtitle: 'Achieve personal alignment before the agent goes "Live"',
      icon: <Download className="h-10 w-10 text-indigo-450 text-indigo-400" />,
      color: 'from-indigo-400 via-purple-200 to-pink-400',
      bullets: [
        { text: 'Securely import Gmail history into a private RL sandbox.' },
        { text: 'Agent generates "Shadow Drafts" based on your past behavior.' },
        { text: 'The goal: Achieve personal alignment before the agent goes "Live."' }
      ]
    },
    {
      id: 'how-it-works',
      title: 'The Training Cycle',
      subtitle: 'The Reinforcement Learning Loop',
      icon: <Activity className="h-10 w-10 text-emerald-400" />,
      color: 'from-emerald-400 via-teal-200 to-cyan-400',
      bullets: [
        { label: 'Recommendation', text: 'Agent drafts a reply using Gemini 3.5 Flash.' },
        { label: 'Feedback', text: 'User accepts, edits, or rejects the draft.' },
        { label: 'Optimization', text: 'Agent adjusts its weights and "Internal Persona" based on your corrections.' }
      ]
    },
    {
      id: 'trustscore',
      title: 'Gamifying Alignment',
      subtitle: 'TrustScore & Gamification Metrics',
      icon: <Target className="h-10 w-10 text-amber-450 text-amber-400" />,
      color: 'from-amber-400 via-orange-200 to-yellow-400',
      bullets: [
        { label: 'The Points System', text: 'Earn points for every successful "match."' },
        { label: 'Complexity Scaling', text: 'Harder emails (client negotiations) worth more than easy ones (RSVPs).' },
        { label: 'TrustScore', text: 'A metric determining when the agent is ready for "Auto-Send" mode.' }
      ]
    },
    {
      id: 'workout-ui',
      title: 'Training While Triage',
      subtitle: 'The "Workout" User Interface',
      icon: <Video className="h-10 w-10 text-rose-400" />,
      color: 'from-rose-400 via-pink-200 to-red-400',
      bullets: [
        { label: 'Webcam Integration', text: 'Uses a lightweight, custom HTML5 Canvas computer vision tracker to detect movements.' },
        { 
          label: 'Disposition Gestures', 
          text: 'Physical head-tilting controls the sandbox decisions:',
          subBullets: [
            'Lean Left: Choose Option 1 (Active reply / confirmation).',
            'Lean Right: Choose Option 2 (Passive snooze / archive).',
            'Hold to Confirm: Maintain the lean position for 2 seconds to execute.'
          ]
        }
      ]
    },
    {
      id: 'subagents',
      title: 'The "Chief of Staff" Model',
      subtitle: 'Simulated Sub-Agent Architecture',
      icon: <Cpu className="h-10 w-10 text-cyan-400" />,
      color: 'from-cyan-400 via-sky-200 to-blue-400',
      bullets: [
        { label: 'Main Agent', text: 'Triages incoming mail in the sandbox and sets priority.' },
        { 
          label: 'Specialized Sub-Agents', 
          text: 'Domain experts simulated inside the alignment space:', 
          subBullets: [
            'Family Agent: Casual tone, knows personal schedules.',
            'Work Agent: Professional, protective of focus time.',
            'Tool Agent: Manages Calendar and Search APIs.'
          ]
        }
      ]
    },
    {
      id: 'why-gemini',
      title: 'The Engine of Speed',
      subtitle: 'Why Gemini 3.5 Flash?',
      icon: <Zap className="h-10 w-10 text-yellow-450 text-yellow-400" />,
      color: 'from-yellow-400 via-amber-200 to-orange-400',
      bullets: [
        { label: 'Instant Feedback', text: 'Sub-200ms latency for real-time "Gym" interaction.' },
        { label: 'High Throughput', text: 'Processes thousands of historical emails in seconds.' },
        { label: 'Long Context', text: '1M context window stores your entire communication history.' }
      ]
    },
    {
      id: 'infrastructure',
      title: 'Managed Agents',
      subtitle: 'Google\'s high-security infrastructure: Security, Memory, & Native Tools',
      icon: <ShieldAlert className="h-10 w-10 text-blue-400" />,
      color: 'from-blue-400 via-indigo-200 to-cyan-400',
      bullets: [
        { label: 'Secure Sandbox (The Locked Office)', text: 'Isolates each sub-agent. The Work Agent cannot see the Family Agent\'s actions, preventing leaks of sensitive data (simulated in sandbox).' },
        { label: 'Persistent State (The Memory Cabinet)', text: 'Gives agents a memory. They remember exactly what you taught them, your rules, and your points across sessions (built via local storage).' },
        { label: 'Native Tools (The Built-In Apps)', text: 'Out-of-the-box secure tools. The agent uses Google Search and Google Calendar to check availability before recommending actions (built via Calendar API & Gemini grounding).' }
      ]
    },
    {
      id: 'impact',
      title: 'Moving Toward True Autonomy',
      subtitle: 'The "Never Been Built" Impact',
      icon: <CheckCircle className="h-10 w-10 text-purple-400" />,
      color: 'from-purple-400 via-violet-200 to-indigo-400',
      bullets: [
        { text: 'Shifts AI from "Assistant" to "Digital Twin."' },
        { text: 'Verifiable trust through a points-based audit trail.' },
        { text: 'The first physical-to-digital training environment for LLMs.' }
      ]
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

  // Helper to extract the color name from the gradient for text and bg styling
  const getColorName = (gradient: string) => {
    const parts = gradient.split(' ');
    const fromColor = parts[0] || 'from-blue-400';
    return fromColor.replace('from-', '').replace('-400', '');
  };

  const colorName = getColorName(slide.color);

  return (
    <div className="flex-grow bg-slate-950 p-6 flex flex-col justify-between min-h-[90vh] text-white font-sans relative overflow-hidden select-none">
      
      {/* Dynamic Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />

      {/* Slide Deck Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-slate-900/60 rounded-xl flex items-center justify-center border border-slate-800">
            <Sparkles className="h-4.5 w-4.5 text-blue-400 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">PITCH DECK</span>
            <p className="text-xs font-bold text-slate-350 tracking-tight">The Inbox Gym</p>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono bg-slate-900/60 px-3 py-1 rounded-full border border-slate-850">
          Slide <span className="text-white font-bold">{currentSlide + 1}</span> of <span className="text-slate-500 font-bold">{slides.length}</span>
        </div>
      </div>

      {/* Main Slide Workspace Container */}
      <div className="relative z-10 my-auto py-8 flex flex-col items-center w-full max-w-4xl mx-auto overflow-y-auto max-h-[72vh] px-2 scrollbar-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="w-full text-center space-y-6"
          >
            {/* Top Icon container with pulsing aura */}
            <div className="relative mx-auto h-20 w-20 flex items-center justify-center mb-2">
              <div className={`absolute inset-0 bg-${colorName}-500/10 rounded-full blur-xl animate-pulse`} />
              <div className="relative z-10 h-16 w-16 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-center shadow-lg">
                {slide.icon}
              </div>
            </div>

            {/* Slide Title */}
            <h2 className={`text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r ${slide.color} bg-clip-text text-transparent tracking-tight leading-none`}>
              {slide.title}
            </h2>

            {/* Slide Subtitle */}
            <p className="text-slate-300 text-lg md:text-xl font-medium max-w-2xl mx-auto tracking-tight leading-relaxed">
              {slide.subtitle}
            </p>

            {/* Slide Bullet points */}
            <div className="w-full max-w-3xl mx-auto mt-8 grid grid-cols-1 gap-4 text-left">
              {slide.bullets.map((bullet, index) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.25 }}
                  key={index}
                  className="group bg-slate-900/40 backdrop-blur-md border border-slate-900 hover:border-slate-800 hover:bg-slate-900/60 p-5 rounded-2xl flex flex-col justify-between gap-4 transition-all duration-300 shadow-xl"
                >
                  <div className="flex items-start gap-4">
                    {/* Bullet indicator */}
                    <div className={`h-8 w-8 rounded-xl bg-slate-950 border border-slate-850 text-slate-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 group-hover:border-slate-700 transition-colors`}>
                      {index + 1}
                    </div>

                    <div className="space-y-2 w-full">
                      <p className="text-base md:text-lg text-slate-300 font-medium leading-relaxed">
                        {bullet.label && (
                          <span className={`font-extrabold mr-2 tracking-tight bg-${colorName}-500/10 text-${colorName}-400 px-2 py-0.5 rounded-lg border border-${colorName}-500/15`}>
                            {bullet.label}
                          </span>
                        )}
                        {bullet.text}
                      </p>
                      
                      {/* Nested Sub-bullets */}
                      {bullet.subBullets && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-800/40">
                          {bullet.subBullets.map((sub, subIdx) => {
                            const [subLabel, ...subRest] = sub.split(':');
                            const subText = subRest.join(':');
                            return (
                              <div key={subIdx} className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl flex flex-col justify-between hover:border-slate-800 transition-colors">
                                <span className={`text-[10px] font-extrabold tracking-wider uppercase font-mono text-${colorName}-400`}>
                                  {subLabel}
                                </span>
                                <span className="text-xs text-slate-400 mt-1 leading-normal">
                                  {subText}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Special Call to Action on the Final Slide */}
            {slide.id === 'impact' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-8 flex justify-center"
              >
                <div className="relative group">
                  <div className={`absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse`} />
                  <button
                    onClick={onStartTraining}
                    className="relative inline-flex items-center gap-3 bg-slate-950 hover:bg-slate-900 text-white border border-slate-800 hover:border-slate-700 font-extrabold text-xs uppercase tracking-widest px-8 py-4 rounded-xl shadow-2xl transition duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-400 animate-bounce" />
                    Launch Sandbox Workout Room
                  </button>
                </div>
              </motion.div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation Bar */}
      <div className="relative z-10 border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Keyboard hints */}
        <div className="text-[10px] text-slate-500 flex items-center gap-2 font-mono bg-slate-900/40 px-3 py-1.5 rounded-xl border border-slate-900">
          <span>Navigation:</span>
          <span className="bg-slate-950 border border-slate-850 px-1.5 py-0.5 rounded text-slate-400 font-bold">&larr;</span>
          <span>Prev</span>
          <span className="bg-slate-950 border border-slate-850 px-1.5 py-0.5 rounded text-slate-400 font-bold">&rarr;</span>
          <span>Next</span>
        </div>

        {/* Slide Dots Navigator */}
        <div className="flex gap-2">
          {slides.map((s, idx) => {
            const activeColorClass = `bg-${getColorName(s.color)}-500`;
            return (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? `w-6 ${activeColorClass}` : 'w-1.5 bg-slate-800 hover:bg-slate-650'
                }`}
                title={s.title}
              />
            );
          })}
        </div>

        {/* Action Arrows */}
        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className={`p-2.5 rounded-xl border transition ${
              currentSlide === 0 
                ? 'border-slate-900 text-slate-800 bg-slate-950/40 cursor-not-allowed' 
                : 'border-slate-850 hover:border-slate-700 text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          
          {currentSlide === slides.length - 1 ? (
            <button
              onClick={onStartTraining}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-md transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Start Training
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="p-2.5 rounded-xl border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 transition"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
