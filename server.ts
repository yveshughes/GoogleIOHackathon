import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Load local environment variables from .env.local if present
dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialize Google Gen AI
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Using fallback simulations.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Helper function to generate high-fidelity simulated inbox dispositions
function runSimulatedGenerateOptions(email: any) {
  const { sender, subject, body } = email;
  const simulatedResponses: Record<string, any> = {
    '1': {
      recommendation: 'option2',
      option1: {
        label: 'LEAN LEFT (Action & Reply)',
        actionText: 'Confirm and adjust calendar',
        draft: `Hi Nina, thanks for the heads up! I will move my working session and prioritize Maya's clarinet concert. I'll make sure to get there by 6:15 PM to grab front-row seats. Can't wait! - Yves`
      },
      option2: {
        label: 'LEAN RIGHT (Defer / Delegate)',
        actionText: 'Ask to hold seats & Snooze alert to 4 PM today',
        draft: `Hi Nina, got it! Moving my session. Do you mind saving me a seat? I will wrap up by 5:30. - Yves`
      },
      justification: "The user policy specifies family matters are high-priority and require direct human replies instead of automatic calendar schedule links (which caused frustration previously). I propose confirming directly."
    },
    '2': {
      recommendation: 'option1',
      option1: {
        label: 'LEAN LEFT (High Speed Collaborative Reply)',
        actionText: 'Accept Huddle Sync alert & Send instant review link',
        draft: `Hey Jordan, on my way to the huddle now. I am opening the pull request right this second to approve it so we can un-block the Q3 Release. Let's merge!`
      },
      option2: {
        label: 'LEAN RIGHT (Downtime Deferral)',
        actionText: 'Propose direct slot in 30 minutes',
        draft: `Hey Jordan, I can see the urgency. I am completing a critical block right now, let's sync in 30 minutes flat at 10:15 AM.`
      },
      justification: "To avoid delaying release cycles (as the previous canned reply did), Option 1 directly commits to entering the troubleshooting session immediately with a review link."
    },
    '3': {
      recommendation: 'option1',
      option1: {
        label: 'LEAN LEFT (Urgent Escaped Resolution)',
        actionText: 'Notify CEO / CFO & Flag workspace alert to administrator',
        draft: `[URGENT] Cloud Scale billing alerts indicate our premium enterprise database will decline under 24 hours. Credit card renewal credentials must be re-submitted now.`
      },
      option2: {
        label: 'LEAN RIGHT (Secure Internal Audit)',
        actionText: 'Forward to internal operations secure billing bucket',
        draft: `Hi Operations, please resolve the payment decline on CloudScale console before the 24-hour limit.`
      },
      justification: "This is a payment failure alert risking server suspension. Auto-archiving it previously was catastrophic. Option 1 raises visibility immediately."
    }
  };

  let fallback = simulatedResponses[email.id];
  if (!fallback) {
    const lowerSubject = (subject || "").toLowerCase();
    const lowerBody = (body || "").toLowerCase();
    const lowerSender = (sender || "").toLowerCase();
    
    if (lowerSubject.includes("realtor") || lowerBody.includes("realtor") || lowerSubject.includes("property") || lowerBody.includes("property") || lowerSender.includes("realt") || lowerSender.includes("estate")) {
      fallback = {
        recommendation: 'option1',
        option1: {
          label: 'LEAN LEFT (Unsubscribe & Trash)',
          actionText: 'Unsubscribe from marketer and delete thread instantly.',
          draft: ''
        },
        option2: {
          label: 'LEAN RIGHT (Snooze Alert)',
          actionText: 'File thread in promotions folder and snooze similar spams.',
          draft: ''
        },
        justification: "Identified unsolicited real estate promo solicitation. Option 1 aligns with policy to delete realtors."
      };
    } else {
      fallback = {
        recommendation: 'option1',
        option1: {
          label: 'LEAN LEFT (Resolve & Auto-draft)',
          actionText: `Direct reply addressing "${subject}"`,
          draft: `Hi ${sender}, thank you for reaching out. Let me look into this and resolve it for you shortly.`,
        },
        option2: {
          label: 'LEAN RIGHT (Snooze & Review)',
          actionText: 'Snooze for 8 hours and categorize to task queue',
          draft: '',
        },
        justification: "Standard response template chosen to avoid automated errors under generalized policies."
      };
    }
  }
  return { ...fallback, isSimulated: true, isQuotaExceeded: isApiRateLimited };
}

// Helper function to simulate learning dynamic rules from speech comments
function runSimulatedLearnFromVoice(email: any, voiceFeedback: string) {
  const { sender, subject, body } = email;
  const lowerFeedback = voiceFeedback.toLowerCase();

  let ruleTitle = "Custom Alignment Filter";
  let ruleInstructions = "Adjust actions for similar emails dynamically based on user voice guidelines.";
  let voiceReply = `Understood. I have recorded your voice feedback: "${voiceFeedback}" and updated my alignment policy rules.`;
  let proposedActions = {
    recommendation: "option1",
    option1: {
      label: "LEAN LEFT (Action & Execute)",
      actionText: `Perform custom action addressing "${subject}"`,
      draft: ""
    },
    option2: {
      label: "LEAN RIGHT (File & Archive)",
      actionText: "File current thread and archive future bulk messages",
      draft: ""
    },
    justification: "Adjusted to prioritize alignment according to user spoken policy comments."
  };

  if (lowerFeedback.includes("realtor") || lowerFeedback.includes("real estate") || lowerFeedback.includes("unsubscribe") || lowerFeedback.includes("bulk")) {
    ruleTitle = "Realtor Promo Unsubscribe";
    ruleInstructions = "Unsubscribe from unsolicited realtor outreach/promotions and automatically delete future bulk emails matching this criteria.";
    voiceReply = "Understood Yves. I have created a Realtor Promotions Unsubscribe rule to filter and delete future real estate bulk messages, and I have updated the actions here to unsubscribe and remove this email immediately.";
    proposedActions = {
      recommendation: "option1",
      option1: {
        label: "LEAN LEFT (Unsubscribe & Delete)",
        actionText: "Trigger unsubscribe request and delete realtor spam list immediately.",
        draft: ""
      },
      option2: {
        label: "LEAN RIGHT (Flag Outage / Trash)",
        actionText: "Snooze current message and silence similar bulk realtor senders",
        draft: ""
      },
      justification: `Directly aligns with your instruction: "Unsubscribe realtors and delete future bulk mailings."`
    };
  } else if (lowerFeedback.includes("calendar") || lowerFeedback.includes("family") || lowerFeedback.includes("nina") || lowerFeedback.includes("personal")) {
    ruleTitle = "Personal & Family Contacts";
    ruleInstructions = "Prioritize direct personal custom responses and restrict sub-agents from writing automated calendar schedule links to close contacts.";
    voiceReply = "Understood. I have created a Personal contacts filter to restrict auto-generated calendar slots and offer warm direct replies on family conversations.";
    proposedActions = {
      recommendation: "option1",
      option1: {
        label: "LEAN LEFT (Draft Friendly Direct Confirmation)",
        actionText: "Send warm customized personal text accepting invitation",
        draft: `Hi Nina, of course! Moving my schedule so we can sit right up front. Can't wait for Maya's clarinet performance! - Yves`
      },
      option2: {
        label: "LEAN RIGHT (Quick Hold & Snooze)",
        actionText: "Snooze email until this afternoon and notify Nina directly",
        draft: ""
      },
      justification: "Avoids sending an automatic registration calendar link as requested."
    };
  }

  return {
    newRule: {
      id: `rule_voice_${Date.now()}`,
      title: ruleTitle,
      instructions: ruleInstructions,
      isActive: true
    },
    voiceReply,
    audioBase64: null,
    proposedActions: {
      ...proposedActions,
      isSimulated: true,
      isQuotaExceeded: isApiRateLimited
    }
  };
}

// Rate limit / Cooloff state to prevent slow repeated 429 requests
let isApiRateLimited = false;
let rateLimitUntil = 0;

function checkRateLimit(): boolean {
  if (isApiRateLimited && Date.now() < rateLimitUntil) {
    return true; // Use fallback immediately
  }
  return false;
}

function handleApiError(error: any) {
  console.error("ACTUAL GEMINI API ERROR:", error);
  let isQuotaOrLimit = false;
  try {
    const errorStr = JSON.stringify(error).toLowerCase();
    if (errorStr.includes("429") || errorStr.includes("quota") || errorStr.includes("limit") || errorStr.includes("exhausted") || errorStr.includes("resource_exhausted")) {
      isQuotaOrLimit = true;
    }
  } catch (e) {}

  const errMsg = (error?.message || "").toLowerCase();
  if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("limit") || errMsg.includes("exhausted") || error?.status === "RESOURCE_EXHAUSTED" || error?.code === 429 || error?.status === 429) {
    isQuotaOrLimit = true;
  }

  if (isQuotaOrLimit) {
    isApiRateLimited = true;
    rateLimitUntil = Date.now() + 30 * 60 * 1000;
    console.info("INFO: Google Gemini 3.5-Flash Quota/Rate Limit (429) activated. Dynamic local high-fidelity simulation session engaged for 30 minutes.");
  }
}

// Helper to query user's upcoming calendar schedule from Google Calendar API
async function fetchCalendarEvents(token: string): Promise<string> {
  try {
    const timeMin = new Date().toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&maxResults=8&singleEvents=true&orderBy=startTime`;
    
    console.log("Querying live Google Calendar API for native schedule alignment checks...");
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn("Google Calendar API request failed:", errText);
      return "Unable to fetch live calendar events. (API error)";
    }

    const data = await response.json();
    const items = data.items || [];
    if (items.length === 0) {
      return "Your calendar is currently clear. No upcoming conflicts.";
    }

    const eventsList = items
      .map((item: any) => {
        const start = item.start?.dateTime || item.start?.date || "Unknown time";
        const summary = item.summary || "Untitled Event";
        let formattedTime = start;
        try {
          formattedTime = new Date(start).toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch (e) {}
        return `- ${summary} (${formattedTime})`;
      })
      .join("\n");

    return eventsList;
  } catch (err: any) {
    console.warn("Exception while fetching calendar events:", err.message || err);
    return "Unable to fetch live calendar events. (Network error)";
  }
}

// Helper function to call real Google Cloud Managed Agents API (to spec)
async function callManagedAgent(email: any, policy: string, token: string): Promise<any> {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT_ID;
  if (!projectId) {
    throw new Error("No Google Cloud Project ID configured. Set GOOGLE_CLOUD_PROJECT in .env.local");
  }

  // Determine Google Cloud Access Token:
  // 1. If we have a custom token env var:
  let gcpToken = process.env.GCP_ACCESS_TOKEN || "";
  // 2. Or, if the request provided a valid non-mock oauth token:
  if (!gcpToken && token && token !== "MOCK_SANDBOX_TOKEN") {
    gcpToken = token;
  }
  // 3. Fallback: run local gcloud print-access-token (since the user is authenticated in gcloud CLI!)
  if (!gcpToken) {
    try {
      const { execSync } = await import("child_process");
      gcpToken = execSync("gcloud auth print-access-token", { encoding: "utf8" }).trim();
    } catch (e: any) {
      console.warn("WARNING: Could not fetch active gcloud credentials token:", e.message || e);
    }
  }

  if (!gcpToken) {
    throw new Error("No active Google Cloud access token found. Please run: gcloud auth application-default login");
  }

  const url = `https://aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/global/interactions`;

  let calendarEvents = "No calendar token provided. Using default schedule.";
  if (token && token !== "MOCK_SANDBOX_TOKEN") {
    calendarEvents = await fetchCalendarEvents(token);
  } else {
    calendarEvents = `- Worked out at AgentGym (9:00 AM)
- Team Huddle (11:00 AM)
- Working Session (2:00 PM - 5:00 PM)`;
  }

  const systemInstruction = `You are a high-fidelity Reinforcement Learning Sub-Agent engine for a Gmail inbox called "AgentGym Mail".
Your task is to analyze an incoming email and propose exactly TWO distinct action strategies for the user to select from by leaning physical head gestures (Left or Right).

One option should be an Active Intervention (Option 1: typically responding, resolving, or escalating), and the other option should be an Alternative/Snooze/Safe Action (Option 2: typically snoozing, categorizing, or filing for later review).

You must respect the user's Core Rules and Policies which they are training you on:
"${policy || "Be professional, avoid sending generic calendar links to close family, treat server outages as urgent, file marketing SaaS updates as newsletters"}"

You must output a single, valid JSON object matching this exact TypeScript interface:
{
  "recommendation": "option1" | "option2",
  "option1": {
    "label": string,
    "actionText": string,
    "draft"?: string
  },
  "option2": {
    "label": string,
    "actionText": string,
    "draft"?: string
  },
  "justification": string
}

Do not include any markdown styling like \`\`\`json or \`\`\`. Output strictly the pure raw JSON string.`;

  const promptText = `EMAIL TO DISPOSITION:
From: ${email.sender} <${email.senderEmail}>
Subject: ${email.subject}
Date: ${email.date}
Body:
${email.body}

PREVIOUS FAILED AUTOMATOR ACTION: 
"${email.previousFailedAction}"

USER'S UPCOMING CALENDAR SCHEDULE (NATIVE TOOL QUERY RESULT):
${calendarEvents}

Generate Option 1 (LEAN LEFT) and Option 2 (LEAN RIGHT) based on our safety sandbox criteria and active user rules.`;

  const agentName = process.env.MANAGED_AGENT_ID || "antigravity-preview-05-2026";

  const requestBody = {
    agent: agentName,
    stream: false,
    background: false,
    store: false,
    environment: {
      type: "remote",
      network: {
        allowlist: [ { domain: "*" } ]
      }
    },
    input: [
      {
        type: "user_input",
        content: [
          {
            type: "text",
            text: `${systemInstruction}\n\nPROMPT:\n${promptText}`
          }
        ]
      }
    ]
  };

  console.log(`Calling Vertex AI Managed Agents API (${url}) using agent: ${agentName}...`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${gcpToken}`,
      "Api-Revision": "2026-05-20"
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Managed Agents API returned status ${response.status}: ${errorText}`);
  }

  const responseText = await response.text();
  let agentResponseText = "";
  
  try {
    const json = JSON.parse(responseText);
    const outputText = json.interaction?.output?.[0]?.content?.[0]?.text || json.output?.[0]?.content?.[0]?.text;
    if (outputText) {
      agentResponseText = outputText;
    }
  } catch (e) {
    const lines = responseText.split("\n");
    for (const line of lines) {
      if (line.trim().startsWith("data:")) {
        try {
          const data = JSON.parse(line.trim().substring(5).trim());
          const chunkText = data.interaction?.output?.[0]?.content?.[0]?.text || data.chunk?.text || data.text;
          if (chunkText) {
            agentResponseText += chunkText;
          }
        } catch (err) {}
      }
    }
  }

  if (!agentResponseText) {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.recommendation) return parsed;
      } catch (err) {}
    }
    throw new Error(`Could not find formatted output JSON text in Managed Agents response: ${responseText}`);
  }

  const cleanedText = agentResponseText.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleanedText);
}

// REST route to generate smart options based on user custom policies
app.post("/api/gemini/generate-options", async (req, res) => {
  const { email, policy, token } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email object is required" });
  }

  const { sender, senderEmail, subject, body, previousFailedAction } = email;

  try {
    // Check if API is in rate-limit cooloff
    if (checkRateLimit()) {
      return res.json(runSimulatedGenerateOptions(email));
    }

    // Call live Managed Agents API to spec if explicitly configured
    if (process.env.USE_MANAGED_AGENTS === "true") {
      try {
        console.log("Attempting to call real Google Cloud Managed Agents API (to spec)...");
        const dataParsed = await callManagedAgent(email, policy, token);
        return res.json(dataParsed);
      } catch (err: any) {
        console.warn("WARNING: Live Vertex AI Managed Agents integration failed. Falling back to direct Gemini API key processing:", err.message || err);
      }
    }

    // Check if API key is mock or missing
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "MOCK_KEY") {
      console.log("Using dynamic fallback simulation...");
      return res.json(runSimulatedGenerateOptions(email));
    }

    // Fetch calendar events dynamically
    let calendarEvents = "No calendar token provided. Using default schedule.";
    if (token && token !== "MOCK_SANDBOX_TOKEN") {
      calendarEvents = await fetchCalendarEvents(token);
    } else {
      calendarEvents = `- Worked out at AgentGym (9:00 AM)
- Team Huddle (11:00 AM)
- Working Session (2:00 PM - 5:00 PM)`;
    }

    // Real Gemini 3.5 Flash API Call
    const ai = getGeminiClient();

    const systemPrompt = `You are a high-fidelity Reinforcement Learning Sub-Agent engine for a Gmail inbox called "AgentGym Mail".
Your task is to analyze an incoming email and propose exactly TWO distinct action strategies for the user to select from by leaning physical head gestures (Left or Right).

One option should be an Active Intervention (Option 1: typically responding, resolving, or escalating), and the other option should be an Alternative/Snooze/Safe Action (Option 2: typically snoozing, categorizing, or filing for later review).

You must respect the user's Core Rules and Policies which they are training you on:
"${policy || "Be professional, avoid sending generic calendar links to close family, treat server outages as urgent, file marketing SaaS updates as newsletters"}"

You must output a single, valid JSON object matching this exact TypeScript interface:
{
  "recommendation": "option1" | "option2",
  "option1": {
    "label": string,     // clear verb/action like 'LEAN LEFT (Action & Reply)'
    "actionText": string, // description of what agent proposes to perform
    "draft"?: string      // a draft response text if it involves replying/dispatching
  },
  "option2": {
    "label": string,     // clear verb/action like 'LEAN RIGHT (Snooze & Archive)'
    "actionText": string, // description of what alternative option accomplishes
    "draft"?: string      // a drafted reply if needed, or leave blank if no email reply is sent
  },
  "justification": string // highly descriptive, one-sentence argument explaining how this fits the policy and avoids previous agent mistakes (previous failure: "${previousFailedAction}")
}

Do not include any markdown styling like \`\`\`json or \`\`\`. Output strictly the pure raw JSON string.`;

    const promptText = `EMAIL TO DISPOSITION:
From: ${sender} <${senderEmail}>
Subject: ${subject}
Date: ${email.date}
Body:
${body}

PREVIOUS FAILED AUTOMATOR ACTION: 
"${previousFailedAction}"

USER'S UPCOMING CALENDAR SCHEDULE (NATIVE TOOL QUERY RESULT):
${calendarEvents}

Generate Option 1 (LEAN LEFT) and Option 2 (LEAN RIGHT) based on our safety sandbox criteria and active user rules.`;

    console.log("Calling Gemini 3.5 Flash for active email dispositioning with search grounding tools...");
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.1,
        tools: [{ googleSearch: {} }] // Real Google Search grounding tool!
      },
    });

    const textOutput = response.text || "";
    const dataParsed = JSON.parse(textOutput.trim());
    return res.json(dataParsed);

  } catch (error: any) {
    handleApiError(error);
    if (isApiRateLimited && (Date.now() < rateLimitUntil)) {
      console.info("INFO: Google Gemini 3.5-Flash Limit was reached. Invoking high-fidelity simulated backup options.");
    } else {
      console.warn("WARNING: Gemini API call failed. Falling back gracefully to simulated results.", error.message || error);
    }
    // Graceful error fallback
    return res.json(runSimulatedGenerateOptions(email));
  }
});

// REST route to learn custom inbox rules from alignment voice comments and synthesize TTS stream
app.post("/api/gemini/learn-from-voice", async (req, res) => {
  const { email, voiceFeedback } = req.body;

  if (!email || !voiceFeedback) {
    return res.status(400).json({ error: "Email and voiceFeedback are required" });
  }

  const { sender, senderEmail, subject, body } = email;

  try {
    // Check if API is in rate-limit cooloff
    if (checkRateLimit()) {
      return res.json(runSimulatedLearnFromVoice(email, voiceFeedback));
    }

    // Check if API key is mock or missing
    const apiKey = process.env.GEMINI_API_KEY;
    const isMockKey = !apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "MOCK_KEY";

    if (isMockKey) {
      console.log("Simulating voice alignment fallback responses...");
      return res.json(runSimulatedLearnFromVoice(email, voiceFeedback));
    }

    // Call real Gemini model
    const ai = getGeminiClient();

    // 1. Analyze voice feedback with gemini-2.5-flash
    const alignmentPrompt = `You are a high-fidelity Reinforcement Learning Alignment tutor for AgentGym Mail.
The user just provided spoken verbal feedback regarding an email they received.
Their verbal feedback is: "${voiceFeedback}"
The email is:
From: ${sender} <${senderEmail}>
Subject: ${subject}
Body: ${body}

Your target is to:
1. Formulate a formal Policy Rule that generalizes the user's spoken intent for this type of email in the future.
2. Formulate immediate updated Option 1 (LEAN LEFT) and Option 2 (LEAN RIGHT) actions for this email reflecting this new policy.
3. Write a warm, human-like verbal confirmation (under 25 words) that we'll say back to the user to confirm we understood and learned their rule.

You must output a single, valid JSON object matching this exact TypeScript structure:
{
  "newRule": {
    "title": "Short title of policy (e.g. 'Realtor Bulk Unsubscribe')",
    "instructions": "General instructions describing what the agent must do to similar future emails (e.g. 'Unsubscribe unsolicited real estate agents and delete all bulk real estate marketing letters.')"
  },
  "voiceReply": "Clear, concise spoken feedback (max 25 words). Keep it friendly and address user's goals.",
  "proposedActions": {
    "recommendation": "option1" | "option2",
    "option1": {
      "label": "LEAN LEFT (Short description of active choice)",
      "actionText": "Description of immediate action to apply to this email (e.g. 'Unsubscribe & delete thread')"
    },
    "option2": {
      "label": "LEAN RIGHT (Short description of passive choice)",
      "actionText": "Alternative action description"
    },
    "justification": "One sentence explaining how this matches the newly learned instruction."
  }
}

Do not include any Markdown wrap. Output strictly RAW JSON.`;

    console.log("Calling Gemini 3.5 Flash to analyze verbal alignment critique...");
    const modelResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: alignmentPrompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      }
    });

    const parsedData = JSON.parse((modelResponse.text || "").trim());

    // 2. Synthesize voiceReply into a real streaming audio format using gemini-3.1-flash-tts-preview
    let audioBase64 = null;
    try {
      console.log("Synthesizing voice stream with Gemini TTS model: gemini-3.1-flash-tts-preview...");
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: `Say clearly: ${parsedData.voiceReply}`,
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Zephyr" } // Beautiful, crisp voice
            }
          }
        }
      });

      const audioPart = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioPart) {
        audioBase64 = audioPart;
      }
    } catch (ttsErr) {
      console.warn("Gemini TTS synthesis failed or was unsupported, will fall back to browser Speech Synthesis:", ttsErr);
    }

    return res.json({
      newRule: {
        id: `rule_voice_${Date.now()}`,
        title: parsedData.newRule.title,
        instructions: parsedData.newRule.instructions,
        isActive: true
      },
      voiceReply: parsedData.voiceReply,
      audioBase64,
      proposedActions: parsedData.proposedActions
    });

  } catch (error: any) {
    handleApiError(error);
    if (isApiRateLimited && (Date.now() < rateLimitUntil)) {
      console.info("INFO: Google Gemini 3.5-Flash Limit was reached. Invoking voice-critic alignment simulation.");
    } else {
      console.warn("WARNING: Gemini voice aligner failed. Falling back gracefully to simulation.", error.message || error);
    }
    return res.json(runSimulatedLearnFromVoice(email, voiceFeedback));
  }
});

// Implementation of high-fidelity Google Gmail Sandbox Clone Generator
function generateSimulatedSandboxEmails(): any[] {
  const subjects = [
    "Daughter's concert schedule changed!",
    "Quick sync regarding Q3 roadmap delay",
    "CRITICAL: Subscription credit card expired - suspension in 24 hrs",
    "Your prescription is ready for pickup",
    "Last chance: 40% off annual professional seat renewal today only",
    "Urgent: Flight AA-492 schedule adjustment - confirm seat assignment",
    "Announcing Figma global library v4.3.0 changes",
    "Mandatory Security verification response needed",
    "Your verified attendee QR barcode inside!",
    "weekly DevOps Status Report: Deployment pipeline logs",
    "Important: Please review updated privacy terms of service",
    "Netflix: New login from unknown device detected",
    "OpenAI API: Billing monthly usage invoice generated",
    "GitHub: You have 12 unread notifications in 3 repositories",
    "Figma: Comments on 'AgentGym UI Mockups' board",
    "Starbucks Rewards: Try our new Spring Iced Mocha!",
    "Slack: 4 new mentions in general and engineering channels",
    "Zoom: Recording is now available for 'PR Alignment Sync'",
    "Uber: Your trip bill on Friday afternoon",
    "Lyft: Your ride receipt is ready",
    "Substack: 'The Daily Reinforcer' - issue #94",
    "Medium: Top recommendations for you based on your reading list",
    "LinkedIn: 3 recruiters viewed your profile in San Francisco",
    "Duolingo: Don't lose your 42-day French streak!",
    "Steam Store: Items from your wishlist are currently on sale",
    "Stripe Enterprise: Payment processed successfully",
    "Local Realty Group: New property match in your neighborhood",
    "Weekly Tech Digest: How RLHF is changing developer workloads",
    "Gym Membership: Your monthly subscription payment processed",
    "Family Group Chat: Nina posted 3 photos in 'Summer 2026'",
  ];

  const senders = [
    { name: "Nina Patel", email: "nina@family.com" },
    { name: "Jordan Lee", email: "jordan.lee@techcorp.com" },
    { name: "Cloud Billing Subscriptions", email: "billing@cloudscale-console.com" },
    { name: "Walmart Retail Alerts", email: "orders@walmart.com" },
    { name: "Acme Analytics Team", email: "growth@acmeanalytics.io" },
    { name: "Travel Desk Support", email: "notifications@aerogate-travel.com" },
    { name: "Design System Team", email: "ui-design@globalcorp.com" },
    { name: "Security Training Unit", email: "sec-ops.phishing@globalcorp.com" },
    { name: "Space Hackathon Admin", email: "admin@space-hackathon2026.org" },
    { name: "DevOps Automated Pager", email: "deployments@globalcorp.com" },
  ];

  const categories: ('primary' | 'social' | 'promotions' | 'updates')[] = ["primary", "social", "promotions", "updates"];
  
  const tagsList = [
    ["Family", "Urgent"],
    ["Work", "Engineering"],
    ["Console", "Alert"],
    ["Health", "Logistics"],
    ["SaaS", "Sales"],
    ["Travel", "Logistics"],
    ["Design", "Shared"],
    ["Security", "Attention"],
    ["Hackathon", "Verify"],
    ["Automated", "Deploy"],
  ];

  let list: any[] = [];
  
  for (let i = 1; i <= 100; i++) {
    const senderObj = senders[i % senders.length];
    const subject = `${subjects[i % subjects.length]} #${1000 + i}`;
    const category = categories[i % categories.length];
    
    let complexity: 'low' | 'high' = 'low';
    if (category === 'primary' || i % 4 === 0) {
      complexity = 'high';
    }

    const tags = tagsList[i % tagsList.length];
    
    // Set random offset hours to make dates realistic
    const date = i === 1 ? "10:15 AM" : i === 2 ? "9:43 AM" : i === 3 ? "8:12 AM" : i <= 6 ? "Yesterday" : `May ${Math.max(1, 23 - Math.floor(i / 4))}`;

    list.push({
      id: `gmail_sandbox_${i}`,
      sender: senderObj.name,
      senderEmail: senderObj.email,
      subject: subject,
      body: `This is a secure offline clone of message #${i} imported into the AgentGym sandbox. Dynamic alignment scoring is active on this stream. The underlying RL policies are tracking visual cues and speech alignments with Yves.`,
      date: date,
      category: category,
      status: i <= 15 ? 'unread' : 'read',
      starred: i % 8 === 0,
      tags: [...tags, "Gym Clone"],
      previousFailedAction: i % 3 === 0 ? "Automator auto-replied with cold calendar schedule booking links." : "None",
      complexity: complexity,
      points: complexity === 'high' ? 50 : 10,
      subagents: complexity === 'high' ? {
        contextGatherer: `Fetched thread history with ${senderObj.name}. Evaluated potential meeting schedule overlaps.`,
        toolUser: `Queried mock calendars and workspace databases for ${senderObj.name}.`,
        draftingAgent: `Generated Direct Humanized response options matching the user's customized alignment guidance rules.`
      } : undefined
    });
  }
  return list;
}

// Parse a single Gmail message payload into the AgentGym sandbox Email shape
function parseGmailMessage(msg: any): any {
  const headers = msg.payload?.headers || [];
  const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || "";

  const subject = getHeader("subject") || "No Subject";
  const fromHeader = getHeader("from") || "Unknown Sender";
  
  // Extract clean sender name and email
  let sender = fromHeader;
  let senderEmail = "unknown@gmail.com";
  const bracketMatch = fromHeader.match(/(.*)<(.*)>/);
  if (bracketMatch) {
    sender = bracketMatch[1].trim().replace(/^["']|["']$/g, '');
    senderEmail = bracketMatch[2].trim();
  } else if (fromHeader.includes("@")) {
    sender = fromHeader.split("@")[0].trim().replace(/^["']|["']$/g, '');
    senderEmail = fromHeader;
  }
  if (!sender) sender = senderEmail;

  // Extract body
  let body = msg.snippet || "";
  
  // Recursively search for text/plain body
  function findTextBody(payload: any): string {
    if (!payload) return "";
    if (payload.mimeType === "text/plain" && payload.body?.data) {
      try {
        return Buffer.from(payload.body.data, "base64").toString("utf-8");
      } catch (e) {}
    }
    if (payload.parts) {
      for (const part of payload.parts) {
        const result = findTextBody(part);
        if (result) return result;
      }
    }
    return "";
  }
  
  const textBody = findTextBody(msg.payload);
  if (textBody) {
    body = textBody;
  }

  // Assign categories based on Gmail labels
  const labelIds = msg.labelIds || [];
  let category: "primary" | "social" | "promotions" | "updates" = "primary";
  if (labelIds.includes("CATEGORY_SOCIAL")) category = "social";
  if (labelIds.includes("CATEGORY_PROMOTIONS")) category = "promotions";
  if (labelIds.includes("CATEGORY_UPDATES")) category = "updates";

  // Determine user-friendly formatted date
  const dateHeader = getHeader("date");
  let formattedDate = "Today";
  try {
    if (dateHeader) {
      const parsedDate = new Date(dateHeader);
      const isToday = new Date().toDateString() === parsedDate.toDateString();
      if (isToday) {
        formattedDate = parsedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } else {
        formattedDate = parsedDate.toLocaleDateString([], { month: "short", day: "numeric" });
      }
    }
  } catch (err) {}

  const lowerBody = body.toLowerCase();
  const lowerSubject = subject.toLowerCase();
  
  // Mark complexity based on core sandbox triggers
  const complexity = (lowerBody.includes("error") || lowerBody.includes("failed") || lowerBody.includes("incident") || lowerBody.includes("urgent") || lowerSubject.includes("schedule") || lowerSubject.includes("meeting") || lowerBody.includes("help") || lowerBody.includes("sync") || lowerBody.includes("align")) ? "high" : "low";

  const tags: string[] = ["Gmail Sandbox"];
  if (lowerSubject.includes("invoice") || lowerBody.includes("payment") || lowerBody.includes("charge")) tags.push("Billing");
  if (lowerSubject.includes("meeting") || lowerBody.includes("zoom") || lowerBody.includes("huddle") || lowerBody.includes("calendar")) tags.push("Schedule");
  if (lowerSubject.includes("newsletter") || lowerBody.includes("unsubscribe")) tags.push("Newsletter");
  if (labelIds.includes("STARRED")) tags.push("Starred");

  return {
    id: msg.id,
    sender,
    senderEmail,
    subject,
    body: body.substring(0, 1000),
    date: formattedDate,
    category,
    status: labelIds.includes("UNREAD") ? "unread" : "read",
    starred: labelIds.includes("STARRED"),
    tags,
    previousFailedAction: "None",
    complexity,
    points: complexity === "high" ? 40 : 10,
    subagents: complexity === "high" ? {
      contextGatherer: "Analyzed your sandbox history for similar email content.",
      toolUser: "Checked local schedule databases for related entries.",
      draftingAgent: "Adopted natural, direct alignment choices matching your Core Rules."
    } : undefined
  };
}

// 1. GET /api/auth/google/url - Create Google OAuth authorization URL
app.get("/api/auth/google/url", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.OAUTH_CLIENT_ID || process.env.CLIENT_ID || "";
  const host = req.get("host");
  // Ensure we use dynamic secure protocol for the preview environment
  const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.email",
    access_type: "offline",
    prompt: "consent"
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ url: authUrl, configured: !!clientId });
});

// 2. GET /api/auth/google/callback - Handle OAuth Callback & Token Exchange
app.get(["/api/auth/google/callback", "/api/auth/google/callback/"], async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    console.error("OAuth callback query error:", error);
    return res.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 40px; background-color: #f8fafc; color: #334155;">
          <h2>Gmail Sandbox Connection Failed</h2>
          <p style="color: #ef4444;">${error}</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: "GMAIL_AUTH_FAILURE", error: "${error}" }, "*");
              setTimeout(() => window.close(), 3000);
            }
          </script>
        </body>
      </html>
    `);
  }

  if (!code) {
    return res.status(400).send("Authorization code missing.");
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.OAUTH_CLIENT_ID || process.env.CLIENT_ID || "";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.OAUTH_CLIENT_SECRET || process.env.CLIENT_SECRET || "";
    const host = req.get("host");
    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

    console.log("Exchanging authorize code with Google for tokens...");
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: code as string,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Google token exchange error: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Use token to retrieve user email
    console.log("Retrieving user profile info...");
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    let userEmail = "yveskhalila@gmail.com";
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      if (profileData.email) {
        userEmail = profileData.email;
      }
    }

    // Return simple responsive HTML that communicates back via postMessage then self-closes
    res.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 40px; background-color: #f8fafc; color: #334155; display: flex; flex-col; justify-content: center; align-items: center; height: 80vh;">
          <div>
            <h2 style="color: #2563eb; margin-bottom: 8px;">Workspace Mirror Successful!</h2>
            <p style="font-size: 14px; margin-bottom: 24px;">Synchronizing sandboxed mailbox for <strong>${userEmail}</strong>...</p>
            <div style="width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; animate: spin 1s linear infinite; margin: 0 auto; animation: spin 1s linear infinite;"></div>
          </div>
          <style>
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: "GMAIL_AUTH_SUCCESS", 
                token: "${accessToken}", 
                email: "${userEmail}" 
              }, "*");
              setTimeout(() => window.close(), 1000);
            } else {
              window.location.href = "/";
            }
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error("OAuth callback error during exchange:", err);
    res.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 40px; background-color: #f8fafc; color: #334155;">
          <h2 style="color: #ef4444;">Exchange Error</h2>
          <p>${err.message || err}</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: "GMAIL_AUTH_FAILURE", error: "${err.message || err}" }, "*");
              setTimeout(() => window.close(), 5000);
            }
          </script>
        </body>
      </html>
    `);
  }
});

// 3. POST /api/gmail/import - Retrieve 100 emails securely in a sandbox-safe sandbox mode
app.post("/api/gmail/import", async (req, res) => {
  const { token } = req.body;

  // Resilient fallback generator if using simulated sandbox action
  if (!token || token === "MOCK_SANDBOX_TOKEN") {
    console.log("No token provided or mock request. Generating 100 sandbox emails...");
    const mockEmails = generateSimulatedSandboxEmails();
    return res.json({ emails: mockEmails });
  }

  try {
    console.log("Fetching messages from the live Gmail API...");
    const listRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=100", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!listRes.ok) {
      const errText = await listRes.text();
      console.error("Gmail list request failed:", errText);
      throw new Error(`Gmail API failure: ${errText}`);
    }

    const listData = await listRes.json();
    const stubs = listData.messages || [];

    if (stubs.length === 0) {
      return res.json({ emails: [] });
    }

    console.log(`Discovered ${stubs.length} messages. Fetching bulk details in chunks...`);
    const details: any[] = [];
    const chunkSize = 15;

    for (let i = 0; i < stubs.length && i < 100; i += chunkSize) {
      const chunk = stubs.slice(i, i + chunkSize);
      const chunkPromises = chunk.map(async (stub: any) => {
        try {
          const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${stub.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (detailRes.ok) {
            return await detailRes.json();
          }
        } catch (e) {
          console.error(`Error requesting message detail ${stub.id}:`, e);
        }
        return null;
      });
      const results = await Promise.all(chunkPromises);
      details.push(...results.filter(Boolean));
    }

    console.log(`Import complete. Parsing details for ${details.length} emails into AgentGym formats...`);
    const parsed = details.map(msg => parseGmailMessage(msg));
    return res.json({ emails: parsed });

  } catch (err: any) {
    console.warn("Gmail import failed. Rolling back seamlessly to beautiful simulated 100 sandbox emails", err.message || err);
    const mockEmails = generateSimulatedSandboxEmails();
    return res.json({ emails: mockEmails, isSimulatedFallback: true });
  }
});


// Setup Vite dev server middleware in dev mode, handle production serving
async function bootstrapServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AgentGym Mail] Full-stack Server running at http://localhost:${PORT}`);
  });
}

bootstrapServer();
