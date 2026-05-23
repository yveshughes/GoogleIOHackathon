import React, { useRef, useEffect, useState } from 'react';
import { Mail, Star, Clock, Send, File, ChevronDown, Check, Video, ShieldAlert, Award, RefreshCw, Settings, Play, Pause, Presentation, Mic, Hand, Volume2 } from 'lucide-react';
import { Email } from '../types';

interface SidebarProps {
  emails: Email[];
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  trustScore: number;
  onReset: () => void;
  // Webcam Gestures
  gestureMode: 'center' | 'left' | 'right';
  setGestureMode: (mode: 'center' | 'left' | 'right') => void;
  cameraAvailable: boolean;
  setCameraAvailable: (available: boolean) => void;
  userEmail: string;
}

export default function Sidebar({
  emails,
  activeMenu,
  setActiveMenu,
  trustScore,
  onReset,
  gestureMode,
  setGestureMode,
  cameraAvailable,
  setCameraAvailable,
  userEmail
}: SidebarProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [xOffset, setXOffset] = useState<number>(0);
  const [calibrationOffset, setCalibrationOffset] = useState<number>(0);
  const [sens, setSens] = useState<number>(1.8); // Sensitivity slider

  // Multi-modal interaction triggers
  const [inputMode, setInputMode] = useState<'smart' | 'keyboard'>('smart');
  const [trackingSource, setTrackingSource] = useState<'nose' | 'finger'>('nose');

  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
  const inputModeRef = useRef(inputMode);
  const sensRef = useRef(sens);

  useEffect(() => {
    inputModeRef.current = inputMode;
  }, [inputMode]);

  useEffect(() => {
    sensRef.current = sens;
  }, [sens]);

  // Count unread sandboxed emails
  const unreadCount = emails.filter(e => e.status === 'unread').length;

  // Let's hook up the real webcam with the consolidated Nose or Finger tip tracker!
  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrameId: number;

    async function startCamera() {
      setIsCameraLoading(true);
      setErrorMsg(null);
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 160, height: 120, facingMode: 'user' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.log("Video play error:", e));
          setCameraAvailable(true);
        }
      } catch (err: any) {
        console.warn("Webcam access denied or unavailable:", err);
        setErrorMsg("Camera access blocked. Using simulated triggers & keyboards.");
        setCameraAvailable(false);
      } finally {
        setIsCameraLoading(false);
      }
    }

    startCamera();

    // CV Centroid nose-tip tracker OR pointing finger tracker with priority fallback
    const runTracker = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;

          // Mirror frame in canvas rendering for normal user view, but run detection
          ctx.save();
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, width, height);
          ctx.restore();

          // Recalculate based on raw canvas pixels
          const frame = ctx.getImageData(0, 0, width, height);
          const data = frame.data;

          if (inputModeRef.current === 'smart') {
            // --- A. ANALYZE NOSE TIP (Region of dark pixels in center face zone) ---
            let minBright = 255;
            for (let y = 35; y < 85; y++) {
              for (let x = 45; x < 115; x++) {
                const idx = (y * width + x) * 4;
                const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                if (brightness < minBright) {
                  minBright = brightness;
                }
              }
            }

            // Find centroid of the nose area
            let sumNoseX = 0;
            let sumNoseY = 0;
            let noseCount = 0;
            const darkThreshold = Math.max(45, Math.min(100, minBright + 16));
            for (let y = 35; y < 85; y++) {
              for (let x = 45; x < 115; x++) {
                const idx = (y * width + x) * 4;
                const brightness = (data[idx] + data[idx+1] + data[idx+2]) / 3;
                if (brightness < darkThreshold) {
                  sumNoseX += x;
                  sumNoseY += y;
                  noseCount++;
                }
              }
            }

            const noseX = noseCount > 0 ? sumNoseX / noseCount : 80;
            const noseY = noseCount > 0 ? sumNoseY / noseCount : 60;

            // --- B. ANALYZE FINGER TIP MOTION (in left vs right third) ---
            let leftDiffSum = 0;
            let leftSumX = 0;
            let leftSumY = 0;
            let leftCount = 0;

            let rightDiffSum = 0;
            let rightSumX = 0;
            let rightSumY = 0;
            let rightCount = 0;

            if (prevFrameRef.current && prevFrameRef.current.length === width * height) {
              for (let y = 15; y < 105; y++) {
                for (let x = 10; x < 150; x++) {
                  const idx = (y * width + x) * 4;
                  const curGray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                  const prevIdx = y * width + x;
                  const prevGray = prevFrameRef.current[prevIdx];
                  const diff = Math.abs(curGray - prevGray);

                  if (diff > 22) { // Motion change trigger threshold
                    if (x < 65) {
                      leftDiffSum += diff;
                      leftSumX += x;
                      leftSumY += y;
                      leftCount++;
                    } else if (x > 95) {
                      rightDiffSum += diff;
                      rightSumX += x;
                      rightSumY += y;
                      rightCount++;
                    }
                  }
                }
              }
            }

            // Keep frame for the next iteration
            if (!prevFrameRef.current || prevFrameRef.current.length !== width * height) {
              prevFrameRef.current = new Uint8ClampedArray(width * height);
            }
            for (let y = 0; y < height; y++) {
              for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                prevFrameRef.current[y * width + x] = (data[idx] + data[idx+1] + data[idx+2]) / 3;
              }
            }

            // Finger gesture priority rules
            const fingerThreshold = 1800; // responsive trigger
            const isLeftFinger = leftDiffSum > fingerThreshold && leftDiffSum > rightDiffSum * 1.5;
            const isRightFinger = rightDiffSum > fingerThreshold && rightDiffSum > leftDiffSum * 1.5;

            let currentXOffset = 0;
            let activeSource: 'nose' | 'finger' = 'nose';
            let fingerTipX = 0;
            let fingerTipY = 0;

            if (isLeftFinger) {
              activeSource = 'finger';
              fingerTipX = leftCount > 0 ? leftSumX / leftCount : 35;
              fingerTipY = leftCount > 0 ? leftSumY / leftCount : 60;
              // Mirrored input trigger: Pointing Left sets positive X offset (triggers select LEFT)
              currentXOffset = 22;
            } else if (isRightFinger) {
              activeSource = 'finger';
              fingerTipX = rightCount > 0 ? rightSumX / rightCount : 125;
              fingerTipY = rightCount > 0 ? rightSumY / rightCount : 60;
              // Mirrored input trigger: Pointing Right sets negative X offset (triggers select RIGHT)
              currentXOffset = -22;
            } else {
              // Priority is Nose tip tracking!
              const currentNoseOffset = 80 - noseX; 
              currentXOffset = (currentNoseOffset - calibrationOffset);
            }

            setXOffset(prev => {
              const weight = activeSource === 'finger' ? 0.35 : 0.18;
              return prev * (1 - weight) + currentXOffset * weight;
            });

            // Sync visual states smoothly
            if (activeSource !== trackingSource) {
              setTrackingSource(activeSource);
            }

            // --- C. RENDER TARGET MARKERS OVER THE VIDEO ---
            // Area boundary indicator
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.25)';
            ctx.setLineDash([1, 2]);
            ctx.strokeRect(45, 35, 70, 50);
            ctx.setLineDash([]);

            // Draw Nose Point (Default priority target)
            ctx.strokeStyle = activeSource === 'finger' ? '#3b82f6/40' : '#10b981';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(noseX, noseY, 5, 0, 2 * Math.PI);
            ctx.stroke();

            ctx.fillStyle = activeSource === 'finger' ? '#3b82f6/40' : '#10b981';
            ctx.beginPath();
            ctx.arc(noseX, noseY, 1.5, 0, 2 * Math.PI);
            ctx.fill();

            if (activeSource === 'finger') {
              // Finger target (Amber glowing tracker)
              ctx.strokeStyle = '#f59e0b';
              ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(fingerTipX, fingerTipY, 7, 0, 2 * Math.PI);
              ctx.fill();
              ctx.stroke();

              // Crosshair lines
              ctx.beginPath();
              ctx.moveTo(fingerTipX - 10, fingerTipY); ctx.lineTo(fingerTipX + 10, fingerTipY);
              ctx.moveTo(fingerTipX, fingerTipY - 10); ctx.lineTo(fingerTipX, fingerTipY + 10);
              ctx.stroke();

              // Draw neon linkage vector
              ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(noseX, noseY);
              ctx.lineTo(fingerTipX, fingerTipY);
              ctx.stroke();
            }

            // Draw HUD Info directly on canvas
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fillRect(3, 3, 154, 20);

            ctx.fillStyle = activeSource === 'finger' ? '#f59e0b' : '#10b981';
            ctx.font = 'bold 7px system-ui, sans-serif';
            ctx.fillText(
              activeSource === 'finger' ? '★ FINGER TARGET ACQUIRED' : '● NOSE TARGET ACQUIRED',
              7,
              11
            );

            ctx.fillStyle = '#94a3b8';
            ctx.font = '6px monospace';
            ctx.fillText(
              activeSource === 'finger' 
                ? `FingerTip: (${fingerTipX.toFixed(0)}, ${fingerTipY.toFixed(0)}) Offset: ${currentXOffset.toFixed(0)}`
                : `NoseTip: (${noseX.toFixed(0)}, ${noseY.toFixed(0)}) Offset: ${currentXOffset.toFixed(1)}`,
              7,
              18
            );
          }
        }
      }
      animationFrameId = requestAnimationFrame(runTracker);
    };

    animationFrameId = requestAnimationFrame(runTracker);

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [calibrationOffset]);

  // Translate X Offset to gesture controls directly!
  useEffect(() => {
    const threshold = sens * 3; 
    if (xOffset > threshold) {
      setGestureMode('left'); 
    } else if (xOffset < -threshold) {
      setGestureMode('right');
    } else {
      setGestureMode('center');
    }
  }, [xOffset, sens]);

  // Calibration manual setter
  const handleCalibrate = () => {
    setCalibrationOffset(xOffset + calibrationOffset);
    setXOffset(0);
  };

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
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Inbox Trust level</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-800">
              {trustScore > 0 ? `+${trustScore.toFixed(0)}` : trustScore.toFixed(0)}
            </span>
            <span className="text-xs text-slate-500 font-medium">points</span>
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

      {/* Inbox Sub-navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5" id="sidebar-inbox-nav">
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

      {/* Multi-Modal Gesture Tracker Panel */}
      <div className="p-3 border-t border-slate-200 bg-slate-100/50 space-y-2">
        
        {/* Header with connection states */}
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-1.5 flex-1 min-w-0 font-sans">
            <Video className="h-3.5 w-3.5 shrink-0 text-blue-600" />
            <span className="text-xs font-bold text-slate-700 truncate">Sandbox Sync</span>
          </div>
          <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide shrink-0 ${
            cameraAvailable && inputMode === 'smart' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
          }`}>
            {cameraAvailable && inputMode === 'smart' ? 'Camera Live' : 'Simulation'}
          </span>
        </div>

        {/* Unified Method tabs switch */}
        <div className="grid grid-cols-2 gap-1 bg-slate-200 p-0.5 rounded-lg text-[10px] font-semibold text-slate-650">
          <button
            onClick={() => { setInputMode('smart'); setXOffset(0); }}
            className={`py-1 rounded text-center transition ${
              inputMode === 'smart' ? 'bg-white text-slate-900 shadow-3xs font-black' : 'text-slate-500 hover:bg-white/40'
            }`}
          >
            Smart Tracker
          </button>
          <button
            onClick={() => { setInputMode('keyboard'); setXOffset(0); }}
            className={`py-1 rounded text-center transition ${
              inputMode === 'keyboard' ? 'bg-white text-slate-900 shadow-3xs font-black' : 'text-slate-500 hover:bg-white/40'
            }`}
          >
            Manual Backup
          </button>
        </div>

        {/* Video feed / Sound alignment visual frame */}
        <div className="relative w-full aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-300 flex items-center justify-center">
          
          {/* Direct Webcam Video element (hidden from frame - process via canvas) */}
          <video
            ref={videoRef}
            className="hidden"
            muted
            playsInline
          />
          
          {/* Canvas processing overlay representing beautiful stream hud */}
          <canvas 
            ref={canvasRef} 
            width="160" 
            height="120" 
            className={`w-full h-full object-cover scale-x-[-1] absolute transition-opacity duration-300 ${
              cameraAvailable && inputMode === 'smart' ? 'opacity-100' : 'opacity-0'
            }`} 
          />

          {/* Manual / Keys state mock overlay */}
          {inputMode === 'keyboard' && (
            <div className="absolute inset-0 bg-slate-950 p-2 text-white flex flex-col justify-between text-center select-none font-sans">
              <div className="text-[8.5px] font-mono text-slate-500 tracking-wider">
                MANUAL KEYBOARD ALIGNMENT
              </div>
              <div className="my-auto flex flex-col items-center gap-1.5">
                <div className="flex gap-2">
                  <span className={`h-8 w-8 rounded border border-slate-700 text-xs font-black font-mono flex items-center justify-center ${gestureMode === 'left' ? 'bg-blue-600 border-blue-500 scale-105' : 'bg-slate-900'}`}>A</span>
                  <span className={`h-8 w-8 rounded border border-slate-700 text-xs font-black font-mono flex items-center justify-center ${gestureMode === 'right' ? 'bg-indigo-600 border-indigo-500 scale-105' : 'bg-slate-900'}`}>D</span>
                </div>
                <div className="text-[9.5px] font-semibold text-slate-300 leading-none">
                  Press A to Select Left, D to Select Right
                </div>
              </div>
              <div className="text-[7.5px] text-slate-500 font-mono uppercase">
                ACTIVE ACTION: {gestureMode.toUpperCase()}
              </div>
            </div>
          )}

          {/* Missing camera offline overlay */}
          {inputMode === 'smart' && !cameraAvailable && !isCameraLoading && (
            <div className="absolute inset-0 bg-slate-100/90 text-slate-900 p-2 text-[10px] flex flex-col justify-center items-center text-center select-none">
              <ShieldAlert className="h-5 w-5 text-amber-500 mb-1" />
              <p className="font-semibold text-amber-805 text-amber-900">Target Camera Offline</p>
              <p className="text-[9px] text-slate-600 mt-1 leading-normal">Use manual simulation keys <kbd className="bg-slate-200 text-slate-850 px-1 py-0.5 rounded font-mono font-bold text-xs border border-slate-300">A</kbd> & <kbd className="bg-slate-200 text-slate-850 px-1 py-0.5 rounded font-mono font-bold text-xs border border-slate-300">D</kbd> or the simulator click clips below.</p>
            </div>
          )}

          {/* Loading overlay */}
          {inputMode === 'smart' && isCameraLoading && (
            <div className="absolute inset-0 bg-slate-900 flex flex-col justify-center items-center text-center">
              <RefreshCw className="h-5 w-5 text-blue-500 animate-spin mb-1" />
              <span className="text-[10px] text-slate-400">Loading CV streams...</span>
            </div>
          )}
        </div>

        {/* Dynamic Controls based on selected Method */}
        <div className="space-y-1.5 text-[10px]" id="sandbox-interaction-parameters">
          
          {inputMode === 'smart' && cameraAvailable && (
            <>
              <div className="flex justify-between text-slate-600 font-sans">
                <span className="font-medium">Tracker Sensitivity:</span>
                <span className="font-mono">{sens.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4"
                step="0.1"
                value={sens}
                onChange={(e) => setSens(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-600"
              />
              <button
                onClick={handleCalibrate}
                className="w-full mt-1 border border-slate-300 hover:border-blue-300 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 py-1.5 px-2 rounded font-medium transition flex items-center justify-center gap-1 text-[9.5px] font-semibold"
              >
                <Settings className="h-3 w-3" />
                Calibrate Center Point
              </button>
            </>
          )}

          {inputMode === 'keyboard' && (
            <div className="p-1.5 rounded bg-slate-200/50 border border-slate-200 space-y-1">
              <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider text-center">Simulated Test Clips</div>
              <div className="grid grid-cols-2 gap-1 bg-transparent">
                <button
                  type="button"
                  onClick={() => {
                    setXOffset(18);
                    setTimeout(() => setXOffset(0), 1800);
                  }}
                  className="bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-400 py-1.5 px-2 rounded text-[9px] font-extrabold text-slate-700 hover:text-blue-700 flex items-center justify-center gap-1 transition shadow-3xs"
                >
                  <Hand className="h-3 w-3 text-blue-500" /> Point Left
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setXOffset(-18);
                    setTimeout(() => setXOffset(0), 1800);
                  }}
                  className="bg-white hover:bg-indigo-50 border border-slate-300 hover:border-indigo-400 py-1.5 px-2 rounded text-[9px] font-extrabold text-slate-700 hover:text-indigo-700 flex items-center justify-center gap-1 transition shadow-3xs"
                >
                  <Hand className="h-3 w-3 text-indigo-505" /> Point Right
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono">
        <p>Sandbox Securely Isolates</p>
        <p className="text-slate-500 font-medium font-sans truncate px-1 mt-0.5">
          {userEmail || 'yveskhalila@gmail.com'}
        </p>
      </div>
    </aside>
  );
}
