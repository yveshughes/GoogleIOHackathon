export interface Email {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  body: string;
  date: string;
  category: 'primary' | 'social' | 'promotions' | 'updates';
  status: 'unread' | 'read' | 'archived' | 'deleted';
  starred?: boolean;
  tags: string[];
  previousFailedAction: string;
}

export interface ProposedOption {
  label: string;       // e.g. "LEAN LEFT (Option 1)"
  actionText: string;  // e.g. "Reply to Nina directly confirming schedule"
  draft?: string;      // e.g. "Draft: Hey Nina, that works perfectly. I will see you there!"
}

export interface ProposedActions {
  recommendation: 'option1' | 'option2';
  option1: ProposedOption;
  option2: ProposedOption;
  justification: string;
}

export interface TrainingLog {
  id: string;
  emailId: string;
  emailSubject: string;
  sender: string;
  actionTaken: 'option1' | 'option2';
  recommendedAction: 'option1' | 'option2';
  userFeedback: 'agree' | 'disagree';
  scoreDelta: number;
  timestamp: string;
}

export interface PolicyRule {
  id: string;
  title: string;
  instructions: string;
  isActive: boolean;
}

export interface TrustHistoryPoint {
  step: number;
  score: number;
  emailSubject: string;
  feedback: string;
}
