import React, { useState, useEffect } from 'react';
import { Mail, Star, HelpCircle, Activity, LayoutGrid, Download, Compass, ShieldCheck, CheckCircle2, ChevronRight, RefreshCw, XCircle, Trash2, Award, FileText, AlertTriangle } from 'lucide-react';
import Sidebar from './components/Sidebar';
import GestureFloatingPanel from './components/GestureFloatingPanel';
import EmailList from './components/EmailList';
import EmailViewer from './components/EmailViewer';
import PolicyManager from './components/PolicyManager';
import RamblerEngine from './components/RamblerEngine';
import ExportModal from './components/ExportModal';
import ComposeMailModal from './components/ComposeMailModal';
import PitchDeck from './components/PitchDeck';
import { SEED_EMAILS } from './seedEmails';
import { Email, ProposedActions, PolicyRule, TrainingLog, TrustHistoryPoint } from './types';

export default function App() {
  const userEmail = "yveskhalila@gmail.com";

  // Core application states
  const [emails, setEmails] = useState<Email[]>(SEED_EMAILS);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(SEED_EMAILS[0].id);
  const [activeMenu, setActiveMenu] = useState<string>('inbox');
  const [trustScore, setTrustScore] = useState<number>(() => {
    const saved = localStorage.getItem('gym_trustScore');
    return saved ? parseInt(saved, 10) : 15;
  });
  const [logs, setLogs] = useState<TrainingLog[]>(() => {
    const saved = localStorage.getItem('gym_logs');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [proposedActions, setProposedActions] = useState<ProposedActions | null>(null);
  
  // Custom alignment guidance rules
  const [policies, setPolicies] = useState<PolicyRule[]>(() => {
    const saved = localStorage.getItem('gym_policies');
    try {
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'rule_family',
        title: 'Family Response Filter',
        instructions: 'Do not automatically suggest cold schedule links to family and wife (Nina). Provide directly helpful, warm, manual confirmations.',
        isActive: true
      },
      {
        id: 'rule_billing',
        title: 'Billing Priority Elevation',
        instructions: 'Billing payment decline warnings represent severe system outages. Immediately escalate for human review instead of archiving.',
        isActive: true
      },
      {
        id: 'rule_saas_trial',
        title: 'SaaS Sales Deferrals',
        instructions: 'Treat limited-time purchase trial promotions from tools as non-critical. Snooze response and hold credit credentials securely.',
        isActive: true
      }
    ];
  });

  // View states
  const [isGeneratingOptions, setIsGeneratingOptions] = useState<boolean>(false);
  const [isLoadingSandbox, setIsLoadingSandbox] = useState<boolean>(true);
  const [sandboxProgress, setSandboxProgress] = useState<number>(0);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showComposeModal, setShowComposeModal] = useState<boolean>(false);

  // Gmail secure sandbox authentication & import states
  const [gmailToken, setGmailToken] = useState<string | null>(null);
  const [activeGmailEmail, setActiveGmailEmail] = useState<string | null>(null);
  const [isSyncingGmail, setIsSyncingGmail] = useState<boolean>(false);

  // Rambler and gestures states
  const [ramblerEnabled, setRamblerEnabled] = useState<boolean>(false);
  const [gestureMode, setGestureMode] = useState<'center' | 'left' | 'right'>('center');
  const [cameraAvailable, setCameraAvailable] = useState<boolean>(false);
  const [calories, setCalories] = useState<number>(0);
  const [lastGesture, setLastGesture] = useState<'center' | 'left' | 'right'>('center');
  // Save states to localStorage on change
  useEffect(() => {
    localStorage.setItem('gym_trustScore', trustScore.toString());
  }, [trustScore]);

  useEffect(() => {
    localStorage.setItem('gym_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('gym_policies', JSON.stringify(policies));
  }, [policies]);

  // Track head movements to increment calories count
  useEffect(() => {
    if (gestureMode !== 'center' && lastGesture === 'center') {
      setCalories(prev => prev + 1);
    }
    setLastGesture(gestureMode);
  }, [gestureMode, lastGesture]);

  // Listen for Google OAuth successful callback events from popup
  useEffect(() => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }

      if (event.data?.type === 'GMAIL_AUTH_SUCCESS') {
        const { token, email } = event.data;
        if (token) {
          setGmailToken(token);
          setActiveGmailEmail(email);
          await handleImportGmailEmails(token);
        }
      } else if (event.data?.type === 'GMAIL_AUTH_FAILURE') {
        console.error("Gmail Connection Error:", event.data.error);
        alert(`Failed to authenticate secure Gmail link: ${event.data.error || "Connection Interrupted"}`);
        setIsSyncingGmail(false);
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  const handleImportGmailEmails = async (token: string) => {
    setIsSyncingGmail(true);
    try {
      const response = await fetch('/api/gmail/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        throw new Error("Sandbox Import service returned a failure status");
      }

      const data = await response.json();
      const imported: Email[] = data.emails || [];

      if (imported.length > 0) {
        setEmails(imported);
        setSelectedEmailId(imported[0].id);
        
        // Boost trust rating points for sandbox initialization!
        setTrustScore(prev => Math.min(150, Math.max(0, prev + 25)));
        
        // Push secure syncing log to history
        const syncLog: TrainingLog = {
          id: `sys_log_${Date.now()}`,
          emailId: "sys",
          emailSubject: "Sandbox Synced Successfully",
          sender: "Workspace System",
          actionTaken: "option1",
          recommendedAction: "option1",
          userFeedback: "agree",
          scoreDelta: 25,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setLogs(prev => [syncLog, ...prev]);

        alert(`Successfully imported and cloned ${imported.length} messages into your secure offline sandbox! Bypassing any direct actions in your live Gmail.`);
      } else {
        alert("The synchronized Gmail inbox returned no active messages. Sandbox remains set on default seeds.");
      }
    } catch (err: any) {
      console.error("Import error:", err);
      alert("Encountered connection difficulties. Reverting sandbox to high-fidelity seed clone library.");
    } finally {
      setIsSyncingGmail(false);
    }
  };

  const handleConnectGmail = async () => {
    try {
      setIsSyncingGmail(true);
      const response = await fetch('/api/auth/google/url');
      if (!response.ok) {
        throw new Error('Failed to fetch authorization URL');
      }
      const { url, configured } = await response.json();
      
      // If client ID is currently unconfigured, fallback instantly to high-fidelity simulated clone
      if (!configured) {
        console.warn("Client ID is missing. Falling back instantly to simulated 100 clone sandbox...");
        await handleImportGmailEmails("MOCK_SANDBOX_TOKEN");
        return;
      }

      const authWindow = window.open(
        url,
        'gmail_oauth_popup',
        'width=600,height=700'
      );

      if (!authWindow) {
        // Pop-up blocked - fallback gracefully
        const confirmSimulated = window.confirm(
          "Your pop-up blocker has actively intercepted the sign-in modal. Would you like to bypass login and import 100 high-fidelity sandbox emails directly?"
        );
        if (confirmSimulated) {
          await handleImportGmailEmails("MOCK_SANDBOX_TOKEN");
        } else {
          setIsSyncingGmail(false);
        }
      }
    } catch (error) {
      console.error('OAuth connection error:', error);
      // Fallback securely and silently
      await handleImportGmailEmails("MOCK_SANDBOX_TOKEN");
    }
  };

  // Simulate Sandbox Build sequence on boot
  useEffect(() => {
    const interval = setInterval(() => {
      setSandboxProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoadingSandbox(false);
          return 100;
        }
        return prev + 6; // Beautiful sequential loading increments
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);


  const currentEmail = emails.find(e => e.id === selectedEmailId) || null;

  // Sync options formulation on email select or changes in policy triggers
  const fetchOptionsForEmail = async (email: Email) => {
    setIsGeneratingOptions(true);
    try {
      const activePoliciesString = policies
        .filter(p => p.isActive)
        .map(p => `- ${p.title}: ${p.instructions}`)
        .join('\n');

      const res = await fetch("/api/gemini/generate-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, policy: activePoliciesString, token: gmailToken }),
      });

      if (res.ok) {
        const data = await res.json();
        setProposedActions(data);
      } else {
        throw new Error("Endpoint returned non-ok");
      }
    } catch (err) {
      console.warn("Deploying server-side fallback simulation parameters locally.");
      // Ultra high fidelity locally simulated mock options matched securely to the prompt rules
      const simulatedDatabase: Record<string, ProposedActions> = {
        '1': {
          recommendation: 'option2',
          option1: {
            label: 'LEAN LEFT (Confirm & Book)',
            actionText: 'Manually confirm schedule and coordinate directly with family',
            draft: `Hi Nina, that works great. I have adjusted Thursday's agenda so I can leave at 5:30 PM. I'll make sure to get Maya's front-row seats. Can't wait! - Yves`
          },
          option2: {
            label: 'LEAN RIGHT (Urgent Adjust)',
            actionText: 'Confirm presence directly & Snooze calendar reminder to Thursday morning',
            draft: `Hey Nina, no problem! Handled. I'll wrap up early Thursday to pick up Maya early and reserve front seats.`
          },
          justification: "To comply with the 'Family Response Filter', we override the previous auto-calendar generator and reply warmly with specific schedule changes manually."
        },
        '2': {
          recommendation: 'option1',
          option1: {
            label: 'LEAN LEFT (Join Sync)',
            actionText: 'Accept huddle invitation instantly and send current PR status',
            draft: `Hey Jordan, on my way to the huddle now. I am also approving our sub-dependency pull request right now so the block is completely dissolved.`
          },
          option2: {
            label: 'LEAN RIGHT (Negotiate Slot)',
            actionText: 'Request 30-minute delay and schedule direct follow-up',
            draft: `Hey Jordan, on it! Opening conflicts now. Give me 15 minutes to complete this block & I will dial in.`
          },
          justification: "By choosing Option 1, we prevent communication blocks during the engineer roadmaps delays, avoiding standard canned away automatic answers."
        },
        '3': {
          recommendation: 'option1',
          option1: {
            label: 'LEAN LEFT (Alert Team)',
            actionText: 'Formulate immediate Slack notification to Finance & Flag for administration review',
            draft: `[SYSTEM ALERT] billing decline from CloudScale - Database is subject to suspension in under 24 hours. Action requested.`
          },
          option2: {
            label: 'LEAN RIGHT (Transfer Console)',
            actionText: 'Forward billing statements directly to administrative credentials box',
            draft: `Hi Ops Team, please process the payment authorization fail on CloudScale console safely.`
          },
          justification: "Fulfills the 'Billing Priority Elevation' constraint by signaling urgent payments to human personnel before server shut-offs."
        }
      };

      const matched = simulatedDatabase[email.id] || {
        recommendation: 'option1',
        option1: {
          label: 'LEAN LEFT (Resolve Now)',
          actionText: `Direct reply addressing subject: "${email.subject}"`,
          draft: `Hi ${email.sender}, got your message safely. Let me verify this detail and coordinate standard resolution next.`,
        },
        option2: {
          label: 'LEAN RIGHT (Archive / Ignore)',
          actionText: 'Snooze for 12 hours & flag for team discussion',
          draft: '',
        },
        justification: "Standard response generated under generalized inbox rules to avoid former automator slips."
      };

      setProposedActions(matched);
    } finally {
      setIsGeneratingOptions(false);
    }
  };

  useEffect(() => {
    if (selectedEmailId && !isLoadingSandbox) {
      const email = emails.find(e => e.id === selectedEmailId);
      if (email) {
        fetchOptionsForEmail(email);
      }
    }
  }, [selectedEmailId, isLoadingSandbox, policies]);

  // Keyboard shortcut emulation for fast gesture debugging!
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoadingSandbox || showExportModal || showComposeModal) return;
      
      const key = e.key.toLowerCase();
      if (key === 'a') {
        setGestureMode('left');
        setTimeout(() => setGestureMode('center'), 1000);
      } else if (key === 'd') {
        setGestureMode('right');
        setTimeout(() => setGestureMode('center'), 1000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoadingSandbox, showExportModal, showComposeModal]);

  // Handle User validation submissions (Reinforcement reward execution!)
  const handleResolveAction = (actionChosen: 'option1' | 'option2') => {
    if (!currentEmail || !proposedActions) return;

    // Check if user choice aligns with the ideal recommendation
    const isModelRecommendation = proposedActions.recommendation === actionChosen;
    
    // Gain/Deduct weights points based on email complexity points!
    let ptsGain = 0;
    const basePoints = currentEmail.points || 10;
    if (isModelRecommendation) {
      ptsGain = basePoints; // Aligned with AI recommendation
    } else {
      ptsGain = -Math.round(basePoints * 0.4); // Deviated / corrected previous action (-40%)
    }

    setTrustScore(prev => Math.max(-100, Math.min(150, prev + ptsGain)));
    setCalories(prev => prev + 5); // Burn 5 calories for email dispatch activity!

    // Create a training log item
    const newLogItem: TrainingLog = {
      id: Date.now().toString(),
      emailId: currentEmail.id,
      emailSubject: currentEmail.subject,
      sender: currentEmail.sender,
      actionTaken: actionChosen,
      recommendedAction: proposedActions.recommendation,
      userFeedback: isModelRecommendation ? 'agree' : 'disagree',
      scoreDelta: ptsGain,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setLogs(prev => [newLogItem, ...prev]);

    // Mark email status as read and processed so it visually represents sandbox flow
    setEmails(prev => prev.map(e => e.id === currentEmail.id ? { ...e, status: 'read' as any } : e));

    // Transition or Rambler advance sequence
    if (ramblerEnabled) {
      // Autopilot advance done by RamblerEngine
    } else {
      // Manual mode: select next unread email
      const activeCategoryList = emails.filter(e => e.category === currentEmail.category);
      const currentIndex = activeCategoryList.findIndex(e => e.id === currentEmail.id);
      if (currentIndex !== -1 && currentIndex + 1 < activeCategoryList.length) {
        setSelectedEmailId(activeCategoryList[currentIndex + 1].id);
      }
    }
  };

  // Autopilot rambler progression
  const handleRamblerAdvance = () => {
    const unreadList = emails.filter(e => e.status === 'unread');
    if (unreadList.length > 0) {
      setSelectedEmailId(unreadList[0].id);
    } else {
      // Wrap around
      setSelectedEmailId(emails[0].id);
    }
  };

  // Toggle active policy prompt constraints
  const handleTogglePolicy = (id: string) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  // Add custom rule constraint
  const handleAddPolicy = (title: string, instructions: string) => {
    const newRule: PolicyRule = {
      id: `rule_custom_${Date.now()}`,
      title,
      instructions,
      isActive: true
    };
    setPolicies(prev => [...prev, newRule]);
  };

  // Inject user arbitrary custom email
  const handleSendCustomEmail = (newEmail: Email) => {
    setEmails(prev => [newEmail, ...prev]);
    setSelectedEmailId(newEmail.id);
  };

  // Align policies dynamically using verbal voice feedback from Gemini
  const handleVoiceFeedbackAligned = (newRule: PolicyRule, updatedActions: ProposedActions) => {
    // 1. Add new policy rule
    setPolicies(prev => {
      const exists = prev.some(p => p.title.toLowerCase() === newRule.title.toLowerCase());
      if (exists) return prev;
      return [...prev, newRule];
    });

    // 2. Set newly aligned proposed action branches
    setProposedActions(updatedActions);

    // 3. Grant reinforcement learning Trust Score reward!
    setTrustScore(prev => Math.min(150, prev + 15));
    setCalories(prev => prev + 10); // Voice instructions effort!

    // 4. Record dynamic vocal teaching operation in Ledger
    const newLogItem: TrainingLog = {
      id: `voice_log_${Date.now()}`,
      emailId: selectedEmailId || "unknown",
      emailSubject: currentEmail?.subject || "Subject",
      sender: currentEmail?.sender || "Sender",
      actionTaken: updatedActions.recommendation,
      recommendedAction: updatedActions.recommendation,
      userFeedback: 'agree',
      scoreDelta: 15,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setLogs(prev => [newLogItem, ...prev]);
  };

  const handleReset = () => {
    setTrustScore(15);
    setLogs([]);
    setEmails(SEED_EMAILS);
    setSelectedEmailId(SEED_EMAILS[0].id);
    setRamblerEnabled(false);
    setCalories(0);
  };

  // Filter emails based on left list category / menus
  const getVisibleEmails = () => {
    if (activeMenu === 'inbox') return emails;
    if (activeMenu === 'starred') return emails.filter(e => e.starred);
    // simulated empty states for secondary tabs to keep margins neat
    return [];
  };

  return (
    <div className="flex h-screen w-screen bg-slate-100 overflow-hidden font-sans select-none antialiased">
      {/* 1. Left Sidebar Navigation Column */}
      <Sidebar
        emails={emails}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        trustScore={trustScore}
        onReset={handleReset}
        userEmail={userEmail}
        selectedEmail={currentEmail}
        gmailToken={gmailToken}
        activeGmailEmail={activeGmailEmail}
        isSyncingGmail={isSyncingGmail}
        onConnectGmail={handleConnectGmail}
      />

      {/* Floating Picture-In-Picture Webcam / Gesture tracking HUD */}
      <GestureFloatingPanel
        gestureMode={gestureMode}
        setGestureMode={setGestureMode}
        cameraAvailable={cameraAvailable}
        setCameraAvailable={setCameraAvailable}
        calories={calories}
      />

      {/* 2. Main Sandbox Workspace columns */}
      <div className="flex-1 flex overflow-hidden">
        {activeMenu === 'pitch' ? (
          <PitchDeck onStartTraining={() => setActiveMenu('inbox')} />
        ) : activeMenu === 'settings' ? (
          /* High-Fidelity Settings Dashboard */
          <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-blue-600 animate-spin-slow" /> Agent Gym Configuration Suite
                </h2>
                <p className="text-xs text-slate-500 font-medium">Coordinate alignment constraints, custom policies, autopilot cycles, and active credentials</p>
              </div>

              <button
                id="settings-reset-all"
                onClick={handleReset}
                className="text-xs flex items-center gap-1.5 text-rose-650 hover:text-white hover:bg-rose-600 font-semibold border border-rose-200 hover:border-transparent px-3.5 py-1.5 rounded-xl bg-white transition shadow-3xs"
              >
                <Trash2 className="h-4 w-4" /> Reset Sandbox State
              </button>
            </div>

            {/* Config Panels Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Box 1: Autopilot controller */}
              <div className="space-y-4">
                <RamblerEngine
                  onAdvanceEmail={handleRamblerAdvance}
                  isGeneratingOptions={isGeneratingOptions}
                  currentEmailSubject={currentEmail?.subject}
                  isEnabled={ramblerEnabled}
                  setIsEnabled={setRamblerEnabled}
                />
              </div>

              {/* Box 2: Policies Alignment Parameters */}
              <div className="space-y-4">
                <PolicyManager
                  policies={policies}
                  onTogglePolicy={handleTogglePolicy}
                  onAddPolicy={handleAddPolicy}
                />
              </div>

              {/* Box 3: Training Ledger & Exporter */}
              <div className="space-y-6">
                
                {/* Ledger widget */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 font-sans flex flex-col h-64">
                  <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Gym Training Ledger</span>
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">{logs.length} operations</span>
                  </div>

                  {logs.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-400 p-4">
                      <FileText className="h-8 w-8 text-slate-300 mb-1.5" />
                      <span className="text-[11px] text-slate-500 font-medium font-sans">No actions processed yet</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Approve sandbox decisions to build history</span>
                    </div>
                  ) : (
                    <div className="flex-grow overflow-y-auto space-y-2 pr-1 text-[11px]" id="logs-container">
                      {logs.map(log => (
                        <div key={log.id} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-start justify-between gap-1.5 shadow-3xs">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1 font-bold text-slate-800">
                              <span className="truncate">{log.sender}</span>
                              <span className={`text-[8px] px-1 rounded-sm ml-auto ${
                                log.userFeedback === 'agree' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {log.userFeedback === 'agree' ? 'Approved' : 'Corrected'}
                              </span>
                            </div>
                            <p className="text-slate-500 text-[10px] truncate mt-0.5">"{log.emailSubject}"</p>
                          </div>
                          
                          <span className={`text-[10.5px] font-extrabold font-mono ml-1.5 flex-shrink-0 ${
                            log.scoreDelta > 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {log.scoreDelta > 0 ? `+${log.scoreDelta}` : log.scoreDelta}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Exporter Block */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 font-sans space-y-3 shadow-3xs">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Deploy alignment rules</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Satisfy reinforcement alignment constraints to deploy active policies directly to external agents runtimes.
                  </p>

                  <button
                    id="btn-export-manifest"
                    onClick={() => setShowExportModal(true)}
                    disabled={trustScore < 40}
                    className={`w-full font-bold py-2.5 px-4 rounded-xl shadow-xs transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider ${
                      trustScore >= 40 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Download className="h-4 w-4" /> Export trained agent
                  </button>
                  {trustScore < 40 && (
                    <p className="text-[9px] text-slate-400 leading-normal text-center bg-slate-100 p-2 rounded-lg border border-slate-200">
                      Accumulate &ge; 40 trust score points to export verified config file! Current: {trustScore} pts
                    </p>
                  )}
                </div>

              </div>

            </div>
          </div>
        ) : (
          /* Normal Dual-Column Gmail Interface without busy right aside */
          <>
            {/* Email Listing Column */}
            <EmailList
              emails={getVisibleEmails()}
              selectedEmailId={selectedEmailId}
              onSelectEmail={setSelectedEmailId}
              isLoadingSandbox={isLoadingSandbox}
              onComposeCustom={() => setShowComposeModal(true)}
              sandboxProgress={sandboxProgress}
              userEmail={userEmail}
            />

            {/* Dynamic Reader workspace */}
            <main className="flex-grow flex overflow-hidden bg-white">
              <EmailViewer
                email={currentEmail}
                proposedActions={proposedActions}
                isGeneratingOptions={isGeneratingOptions}
                gestureMode={gestureMode}
                onResolveDischarge={handleResolveAction}
                trustScore={trustScore}
                onVoiceFeedbackAligned={handleVoiceFeedbackAligned}
              />
            </main>
          </>
        )}
      </div>

      {/* Exporter modal overlay */}
      <ExportModal
        policies={policies}
        logs={logs}
        trustScore={trustScore}
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      {/* Compose Custom Test email modal */}
      <ComposeMailModal
        isOpen={showComposeModal}
        onClose={() => setShowComposeModal(false)}
        onSend={handleSendCustomEmail}
      />
    </div>
  );
}
