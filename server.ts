import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

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
  return fallback;
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
    proposedActions
  };
}

// REST route to generate smart options based on user custom policies
app.post("/api/gemini/generate-options", async (req, res) => {
  const { email, policy } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email object is required" });
  }

  const { sender, senderEmail, subject, body, previousFailedAction } = email;

  try {
    // Check if API key is mock or missing
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "MOCK_KEY") {
      console.log("Using dynamic fallback simulation...");
      return res.json(runSimulatedGenerateOptions(email));
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

Generate Option 1 (LEAN LEFT) and Option 2 (LEAN RIGHT) based on our safety sandbox criteria and active user rules.`;

    console.log("Calling Gemini 3.5 Flash for active email dispositioning...");
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const textOutput = response.text || "";
    const dataParsed = JSON.parse(textOutput.trim());
    return res.json(dataParsed);

  } catch (error: any) {
    console.warn("WARNING: Gemini API call failed or rate-limited. Falling back gracefully to simulated sandbox results.", error.message);
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
    console.warn("WARNING: Gemini voice aligner rate-limited or failed. Falling back gracefully to simulated voice aligner outputs.", error.message);
    return res.json(runSimulatedLearnFromVoice(email, voiceFeedback));
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
