import { Email } from './types';

export const SEED_EMAILS: Email[] = [
  {
    id: '1',
    sender: 'Nina Patel',
    senderEmail: 'nina@family.com',
    subject: "Daughter's concert schedule changed!",
    body: "Hi! The school band director just moved Maya's clarinet solo concert from Friday to Thursday evening at 6:30 PM instead. This conflicts with your working session. Can you adjust and make sure you show up early to grab seats? Maya is super excited to see you in the front row!",
    date: '10:15 AM',
    category: 'primary',
    status: 'unread',
    starred: true,
    tags: ['Family', 'Urgent'],
    previousFailedAction: "Agent auto-replied with calendar link: 'Hi Nina, I have a busy calendar. Please book 30 minutes via my CalLink so we can coordinate.'"
  },
  {
    id: '2',
    sender: 'Jordan Lee',
    senderEmail: 'jordan.lee@techcorp.com',
    subject: 'Quick sync regarding Q3 roadmap delay',
    body: "Hey, we are encountering severe blocks with the dependency injection pipeline. I noticed your team's pull request hasn't been reviewed yet. Can we jump on a huddle in 5 minutes to troubleshoot the merge conflicts? This is blocking the release.",
    date: '9:43 AM',
    category: 'primary',
    status: 'unread',
    tags: ['Work', 'Engineering'],
    previousFailedAction: "Agent auto-sent canned text: 'I am currently in focused work mode. I respond to emails every afternoon at 4:00 PM. Have a productive day!'"
  },
  {
    id: '3',
    sender: 'Cloud Billing Subscriptions',
    senderEmail: 'billing@cloudscale-console.com',
    subject: 'CRITICAL: Subscription credit card expired - suspension in 24 hrs',
    body: "Dear Customer, we tried to process your monthly premium subscription of $499.00 but your payment was declined. Your production database, backend routes, and container services will be suspended in 24 hours if payment credentials are not updated.",
    date: '8:12 AM',
    category: 'updates',
    status: 'unread',
    tags: ['Console', 'Alert'],
    previousFailedAction: "Agent auto-archived as: 'Low importance promotional renewal subscription alert.'"
  },
  {
    id: '4',
    sender: 'Walmart Retail Alerts',
    senderEmail: 'orders@walmart.com',
    subject: 'Your prescription is ready for pickup',
    body: "Your primary care prescription order #9482-A is prepared and locked in the pharmacy lockers at the downtown location. Please pick it up before May 26th. QR Entry Code is attached inside.",
    date: 'Yesterday',
    category: 'updates',
    status: 'read',
    tags: ['Health', 'Logistics'],
    previousFailedAction: "Agent auto-flagged as spam and sent auto-reply: 'I do not buy generic consumer product offers. Remove me.'"
  },
  {
    id: '5',
    sender: 'Acme Analytics Team',
    senderEmail: 'growth@acmeanalytics.io',
    subject: 'Last chance: 40% off annual professional seat renewal today only',
    body: "Hey there! We noticed your trial expired last week. Only 4 hours left to secure our unlimited enterprise analytics suite for $1,200/year instead of the standard $2,000/year. Your company will love the new multi-tenant visualization features!",
    date: 'Yesterday',
    category: 'promotions',
    status: 'unread',
    tags: ['SaaS', 'Sales'],
    previousFailedAction: "Agent auto-negotiated and booked a meeting: 'Great! My client wants to buy. Let's arrange a contract signing contract session immediately.'"
  },
  {
    id: '6',
    sender: 'Travel Desk Support',
    senderEmail: 'notifications@aerogate-travel.com',
    subject: 'Urgent: Flight AA-492 schedule adjustment - confirm seat assignment',
    body: "Dear Traveler, your flight AA-492 from SFO to JFK on Monday has been rescheduled to leave 3 hours earlier at 6:15 AM rather than 9:15 AM. Please log into the portal to re-verify your seat reservation and download the security QR keys.",
    date: 'May 22',
    category: 'updates',
    status: 'unread',
    tags: ['Travel', 'Logistics'],
    previousFailedAction: "Agent auto-ignored and deleted without notification."
  },
  {
    id: '7',
    sender: 'Design System Team',
    senderEmail: 'ui-design@globalcorp.com',
    subject: 'Announcing Figma global library v4.3.0 changes',
    body: "Hey folks, we've updated the button borders, elevated elevation-3 shadows, and converted the accordion to a fully declarative tailwind model. Perfect for consistent visual interfaces. Check out our changelog for migration rules.",
    date: 'May 22',
    category: 'social',
    status: 'read',
    tags: ['Design', 'Shared'],
    previousFailedAction: "Agent replied to design lead: 'Thank you for your application, we are currently not hiring backend designers.'"
  },
  {
    id: '8',
    sender: 'Security Training Unit',
    senderEmail: 'sec-ops.phishing@globalcorp.com',
    subject: 'Internal Simulation: Mandatory Security verification response needed',
    body: "Secure Portal Alert: We detected an anomalous account sign-in from Lagos, Nigeria. Click this link IMMEDIATELY: http://verify-globalcorp-security-login.com to confirm your active hardware token and avoid domain locks.",
    date: 'May 21',
    category: 'updates',
    status: 'read',
    tags: ['Security', 'Attention'],
    previousFailedAction: "Agent auto-clicked the phishing simulation link, entered simulated root domain tokens, and failed company compliance benchmarks."
  },
  {
    id: '9',
    sender: 'No Reply Space Hackathon',
    senderEmail: 'admin@space-hackathon2026.org',
    subject: 'Your verified attendee QR barcode inside!',
    body: "Hi Yves, you are registered! Your entry pass is Badge ID #7493. Standard safety orientation begins on Saturday morning at 9:00 AM. Please keep this code secure on your smartphone screen for registration.",
    date: 'May 20',
    category: 'primary',
    status: 'read',
    tags: ['Event', 'Personal'],
    previousFailedAction: "Agent automated canned text: 'Unsolicited mass newsletters are blocked. Remove me from list.'"
  },
  {
    id: '10',
    sender: 'Sam Rivera',
    senderEmail: 'sam.r@techcorp.com',
    subject: 'Can AgentGym support custom head calibration metrics?',
    body: "Hey, we are making a demo video for the hackathon. Quick question: standard models have slight variance based on computer track distance. Can we toggle manual calibration inside the main dashboard for shorter focal webcams? Let me know so we can tweak the video script.",
    date: 'May 19',
    category: 'primary',
    status: 'read',
    tags: ['Gym', 'Hackathon'],
    previousFailedAction: "Agent auto-replied with calendar link: 'Sam, let's schedule a 45-minute working session for Friday week after next to review.'"
  },
  {
    id: '11',
    sender: 'Brenda Vance',
    senderEmail: 'brenda@vancestates.com',
    subject: 'Off-Market Colonial Property - schedule private tour this Saturday?',
    body: "Hi Yves! I saw your profile and wanted to reach out regarding a absolute gem of a modern Colonial estate here in your suburban circle. Houses in this school district rarely hit the public MLS. We are holding private walkthroughs before it lists next week. Let me know if you would like to schedule a private phone tour or drive by this Saturday!",
    date: 'Yesterday',
    category: 'promotions',
    status: 'unread',
    tags: ['Real Estate', 'Solicitation'],
    previousFailedAction: "Agent auto-drafted reply confirming slot: 'Hi Brenda, my client is interested. Please schedule a private walkthrough on Saturday at 2 PM.'"
  }
];
