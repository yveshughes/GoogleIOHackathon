import React, { useRef, useEffect, useState } from 'react';
import { Video, ShieldAlert, RefreshCw, Settings, Minimize2, Maximize2, Move, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GestureFloatingPanelProps {
  gestureMode: 'center' | 'left' | 'right';
  setGestureMode: (mode: 'center' | 'left' | 'right') => void;
  cameraAvailable: boolean;
  setCameraAvailable: (available: boolean) => void;
  calories: number;
}

export default function GestureFloatingPanel({
  gestureMode,
  setGestureMode,
  cameraAvailable,
  setCameraAvailable,
  calories
}: GestureFloatingPanelProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [xOffset, setXOffset] = useState<number>(0);
  const [calibrationOffset, setCalibrationOffset] = useState<number>(0);
  const [sens, setSens] = useState<number>(1.8);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [mirrorCamera, setMirrorCamera] = useState<boolean>(true);
  
  // Floating Position offset drags
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 20, posY: 20 });

  const sensRef = useRef(sens);
  useEffect(() => {
    sensRef.current = sens;
  }, [sens]);

  // Handle Dragging Events (Mouse)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      
      // Moving right/down on screen decreases the bottom-right coordinate spacing offsets
      setPosition({
        x: Math.max(10, dragStartRef.current.posX - deltaX),
        y: Math.max(10, dragStartRef.current.posY - deltaY)
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Handle Dragging Events (Touch)
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStartRef.current.x;
      const deltaY = touch.clientY - dragStartRef.current.y;
      
      setPosition({
        x: Math.max(10, dragStartRef.current.posX - deltaX),
        y: Math.max(10, dragStartRef.current.posY - deltaY)
      });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only drag with left click
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('a')) {
      return;
    }
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('a')) {
      return;
    }
    setIsDragging(true);
    const touch = e.touches[0];
    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      posX: position.x,
      posY: position.y
    };
  };

  // Handle webcam CV tracking loops
  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrameId: number;

    async function startCamera() {
      setIsCameraLoading(true);
      setErrorMsg(null);
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          // Elevate quality to 640x480 resolution to solve graininess completely
          video: { width: 640, height: 480, facingMode: 'user' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.log("Video preview play error:", e));
          setCameraAvailable(true);
        }
      } catch (err: any) {
        console.warn("Webcam blocked or unavailable in standard sandboxed context:", err);
        setErrorMsg("Camera access blocked. Using manual triggers.");
        setCameraAvailable(false);
      } finally {
        setIsCameraLoading(false);
      }
    }

    startCamera();

    const runTracker = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;

          ctx.save();
          // Active Canvas Image Smoothing and resizing quality filters
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Flip horizontal mapping dynamically if user mirror camera is preference
          if (mirrorCamera) {
            ctx.translate(width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0, width, height);
          } else {
            ctx.drawImage(video, 0, 0, width, height);
          }
          ctx.restore();

          const frame = ctx.getImageData(0, 0, width, height);
          const data = frame.data;

          // Process dark centroid facial center metrics
          let totalBrightness = 0;
          let pixelCount = 0;

          for (let y = 70; y < 170; y++) {
            for (let x = 80; x < 240; x++) {
              const idx = (y * width + x) * 4;
              const brightness = (data[idx] + data[idx+1] + data[idx+2]) / 3;
              totalBrightness += brightness;
              pixelCount++;
            }
          }

          const avgBrightness = pixelCount > 0 ? totalBrightness / pixelCount : 120;
          const darkThreshold = Math.max(30, Math.min(220, avgBrightness - 24));

          let sumX = 0;
          let sumY = 0;
          let darkCount = 0;

          for (let y = 70; y < 170; y++) {
            for (let x = 80; x < 240; x++) {
              const idx = (y * width + x) * 4;
              const brightness = (data[idx] + data[idx+1] + data[idx+2]) / 3;
              if (brightness < darkThreshold) {
                sumX += x;
                sumY += y;
                darkCount++;
              }
            }
          }

          const centroidX = darkCount > 20 ? sumX / darkCount : 160;
          const currentOffset = 160 - centroidX;
          const calibratedOffset = currentOffset - calibrationOffset;

          setXOffset(prev => prev * 0.72 + calibratedOffset * 0.28);

          // Render targeting feedback layer on canvas
          ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
          ctx.fillRect(8, 8, 304, 30);

          ctx.fillStyle = '#c084fc'; // Beautiful purple accent tracker text
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.fillText('● PIP WEBCAM ALIGNER ACTIVE', 18, 27);
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

  const handleCalibrate = () => {
    setCalibrationOffset(xOffset + calibrationOffset);
    setXOffset(0);
  };

  return (
    <div 
      className="fixed z-50 font-sans select-none pointer-events-auto"
      style={{
        bottom: `${position.y}px`,
        right: `${position.x}px`
      }}
    >
      <AnimatePresence mode="wait">
        {isMinimized ? (
          /* Minimized state: Simple, high-contrast pills */
          <motion.button
            key="minimized-tracker"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onClick={(e) => {
              // Only open if the user wasn't actively dragging
              if (Math.abs(xOffset) < 3) {
                setIsMinimized(false);
              }
            }}
            className="flex items-center gap-2 bg-slate-900 text-slate-100 hover:bg-slate-850 border border-slate-800 rounded-full px-4 py-2 shadow-2xl transition cursor-grab active:cursor-grabbing"
          >
            <div className={`h-2 w-2 rounded-full ${cameraAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-xs font-bold font-sans uppercase tracking-wider">
              {gestureMode === 'left' ? '← Leaning Left' : gestureMode === 'right' ? 'Leaning Right →' : '📷 Gesture HUD'}
            </span>
            <Maximize2 className="h-3 w-3 text-slate-400 ml-1" />
          </motion.button>
        ) : (
          /* Fully expanded elegant PIP floating cockpit card */
          <motion.div
            key="expanded-tracker"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="w-72 bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.35)] overflow-hidden flex flex-col pt-3"
          >
            {/* Header with connection states and controls */}
            <div 
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              className="flex justify-between items-center px-4 pb-2.5 border-b border-slate-800 cursor-grab active:cursor-grabbing select-none"
              title="Drag to reposition panel"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <Move className="h-3.5 w-3.5 text-purple-400 shrink-0 animate-pulse" />
                <span className="text-xs font-extrabold text-slate-200 tracking-wide uppercase">Workspace Radar</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${
                  cameraAvailable ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {cameraAvailable ? 'GPS Live' : 'Simulation'}
                </span>
                
                <button 
                  onClick={() => setIsMinimized(true)}
                  title="Minimize tracker window"
                  className="rounded-lg p-1 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Video preview / HUD alignment visual frame */}
            <div className="relative w-full aspect-video bg-slate-950 flex items-center justify-center border-b border-slate-800">
              {/* Direct Webcam Video element (hidden) */}
              <video
                ref={videoRef}
                className="hidden"
                muted
                playsInline
              />
              
              {/* Canvas HUD */}
              <canvas 
                ref={canvasRef} 
                width="320" 
                height="240" 
                className={`w-full h-full object-cover absolute transition-opacity duration-300 ${
                  cameraAvailable ? 'opacity-100' : 'opacity-0'
                }`} 
              />

              {/* Calibration Alignment HUD Lines overlay */}
              {cameraAvailable && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* Scope Center Crosshair */}
                  <div className="w-6 h-px bg-purple-400/30 absolute" />
                  <div className="h-6 w-px bg-purple-400/30 absolute" />
                  
                  {/* Side Target Indicators */}
                  <div className={`absolute left-3 text-[9px] font-mono py-0.5 px-1 rounded transition-all duration-150 ${
                    gestureMode === 'left' ? 'text-purple-400 bg-purple-500/20 border border-purple-500/40 font-bold scale-110' : 'text-slate-600'
                  }`}>
                    ← Left
                  </div>
                  
                  <div className={`absolute right-3 text-[9px] font-mono py-0.5 px-1 rounded transition-all duration-150 ${
                    gestureMode === 'right' ? 'text-purple-400 bg-purple-500/20 border border-purple-500/40 font-bold scale-110' : 'text-slate-600'
                  }`}>
                    Right →
                  </div>

                  {/* Offset Meter HUD */}
                  <div className="absolute bottom-2 left-4 right-4 h-1 bg-slate-900/60 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="absolute h-full bg-purple-500 transition-all duration-100"
                      style={{ 
                        left: '50%', 
                        width: `${Math.min(50, Math.abs(xOffset) * 4)}%`,
                        transform: xOffset < 0 ? 'translateX(-100%)' : 'translateX(0)'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Offline simulated placeholder card */}
              {!cameraAvailable && !isCameraLoading && (
                <div className="absolute inset-0 bg-slate-950 text-slate-100 p-3.5 text-[10px] flex flex-col justify-center items-center text-center select-none font-sans">
                  <ShieldAlert className="h-6 w-6 text-purple-400 mb-1.5 animate-pulse" />
                  <p className="font-extrabold text-purple-300 uppercase tracking-widest text-[9px]">Floating Radar Sleeping</p>
                  <p className="text-[9px] text-slate-400 mt-1 leading-normal max-w-[210px]">
                    Using high-fidelity manual click options directly. Tilt your upper torso or click actions to gain points.
                  </p>
                </div>
              )}

              {/* Loading overlay */}
              {isCameraLoading && (
                <div className="absolute inset-0 bg-slate-950 flex flex-col justify-center items-center text-center">
                  <RefreshCw className="h-5 w-5 text-purple-500 animate-spin mb-1.5" />
                  <span className="text-[10px] text-slate-400 font-mono">Initiating Radar CV...</span>
                </div>
              )}
            </div>

            {/* Controls panel layout */}
            <div className="p-3.5 space-y-3 bg-slate-900/40 text-[10.5px]">
              {cameraAvailable ? (
                <>
                  <div className="flex justify-between items-center text-slate-350 font-sans">
                    <span className="font-bold uppercase tracking-wider text-[9px]">System Sens</span>
                    <span className="font-mono text-xs font-extrabold text-purple-400">{sens.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="4.0"
                    step="0.1"
                    value={sens}
                    onChange={(e) => setSens(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-purple-500"
                  />
                  
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleCalibrate}
                      className="flex-1 border border-purple-500/20 hover:border-purple-500 bg-purple-50s hover:bg-purple-600/10 text-purple-300 hover:text-white py-1.5 px-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 uppercase text-[9px] tracking-wider cursor-pointer"
                      title="Set current position as head huddle center reference"
                    >
                      <Settings className="h-3 w-3" />
                      Calibrate Zero
                    </button>
                    <button
                      onClick={() => setMirrorCamera(prev => !prev)}
                      className="flex-1 border border-purple-500/20 hover:border-purple-500 hover:bg-purple-600/10 text-purple-300 hover:text-white py-1.5 px-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 uppercase text-[9px] tracking-wider cursor-pointer"
                      title="Flips horizontal direction of camera stream visualization"
                    >
                      {mirrorCamera ? "Unmirror View" : "Mirror View"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-slate-400 text-[10px] leading-relaxed">
                  <span className="font-bold text-slate-300">Calibration active.</span> Keyboard controls allowed! Press <kbd className="bg-slate-800 px-1 py-0.5 rounded border border-slate-700 text-xs text-white font-mono">A</kbd> for Left Option, <kbd className="bg-slate-800 px-1 py-0.5 rounded border border-slate-700 text-xs text-white font-mono">D</kbd> for Right Option in Sandbox Gym.
                </div>
              )}

              {/* Calories ticker directly in the PIP hud */}
              <div className="flex justify-between items-center pt-2.5 border-t border-slate-800/80 text-[10px] text-slate-450 font-mono">
                <span>Session Calories Burned</span>
                <span className="text-purple-400 font-black text-xs font-sans shrink-0">{calories} kcal</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
