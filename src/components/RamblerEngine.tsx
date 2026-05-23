import React, { useState, useEffect } from 'react';
import { Play, Pause, Compass, Activity, CheckCircle, ChevronRight, Gauge } from 'lucide-react';

interface RamblerEngineProps {
  onAdvanceEmail: () => void;
  isGeneratingOptions: boolean;
  currentEmailSubject: string | undefined;
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
}

export default function RamblerEngine({
  onAdvanceEmail,
  isGeneratingOptions,
  currentEmailSubject,
  isEnabled,
  setIsEnabled
}: RamblerEngineProps) {
  const [speed, setSpeed] = useState<number>(6); // Speed in seconds
  const [secondsRemaining, setSecondsRemaining] = useState<number>(speed);

  // Rambler countdown logic
  useEffect(() => {
    let timer: any;
    if (isEnabled && !isGeneratingOptions) {
      if (secondsRemaining > 0) {
        timer = setTimeout(() => {
          setSecondsRemaining(prev => prev - 1);
        }, 1000);
      } else {
        // Time to advance!
        onAdvanceEmail();
        setSecondsRemaining(speed);
      }
    }
    return () => clearTimeout(timer);
  }, [isEnabled, secondsRemaining, isGeneratingOptions, speed]);

  // Reset countdown if user pauses or changes email/speed
  useEffect(() => {
    setSecondsRemaining(speed);
  }, [isEnabled, speed, currentEmailSubject]);

  return (
    <div className="bg-white rounded-2xl border border-slate-205 p-4 font-sans shadow-xs relative overflow-hidden">
      {/* Visual scanning line */}
      {isEnabled && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 animate-pulse" />
      )}

      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Compass className={`h-4.5 w-4.5 ${isEnabled ? 'text-blue-500 animate-spin-slow' : 'text-slate-400'}`} />
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Rambler Navigation Autopilot</h3>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-bold">Google Rambler Core Sync</p>
          </div>
        </div>

        <button
          onClick={() => setIsEnabled(!isEnabled)}
          className={`text-xs flex items-center gap-1 px-3 py-1 rounded-full font-bold transition-all ${
            isEnabled 
              ? 'bg-amber-100 hover:bg-amber-200 text-amber-700' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isEnabled ? (
            <>
              <Pause className="h-3.5 w-3.5 fill-current" /> Pause Rambler
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current animate-pulse" /> Engage Rambler
            </>
          )}
        </button>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
        Simulates custom high-frequency agent evaluation Loops. Rambler navigates through sandbox items sequentially and executes default selections automatically.
      </p>

      {/* Controller dials */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
            <Gauge className="h-3.5 w-3.5 text-slate-400" />
            <span>Crawler Frequency</span>
          </div>

          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-bold font-mono text-slate-800">{speed}s</span>
            <span className="text-[10px] text-slate-400 font-medium">cycle</span>
          </div>

          <div className="flex gap-1.5 mt-2">
            {[3, 6, 10].map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`flex-1 text-[9px] font-bold py-0.5 px-1 rounded border transition ${
                  speed === s
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-slate-350 text-slate-600 bg-white'
                }`}
              >
                {s === 3 ? 'Fast' : s === 6 ? 'Norm' : 'Slow'}
              </button>
            ))}
          </div>
        </div>

        {/* Live scanning progress feed */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-slate-400 uppercase">Scanner Status</span>
          
          <div className="mt-1">
            {isEnabled ? (
              isGeneratingOptions ? (
                <div className="text-[11px] text-blue-600 font-bold animate-pulse flex items-center gap-1">
                  <Activity className="h-3 w-3 text-blue-500 animate-spin" /> Analyzing Options...
                </div>
              ) : (
                <div className="text-[11.5px] font-bold text-slate-700 truncate">
                  Advancing in {secondsRemaining}s
                </div>
              )
            ) : (
              <span className="text-[11.5px] font-medium text-slate-400 italic">Autopilot Offline</span>
            )}
          </div>

          <p className="text-[9.5px] text-slate-500 truncate mt-1">
            {currentEmailSubject ? `Active: "${currentEmailSubject}"` : 'Idle'}
          </p>
        </div>
      </div>
    </div>
  );
}
