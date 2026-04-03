const successMessages: Record<string, string[]> = {
  bm: [
    'Logged and noted.',
    'Another data point for your health story.',
    'Your gut thanks you for the update.',
    'Noted. Your future self will appreciate this.',
    'One more entry in the books.',
  ],
  food: [
    'Meal logged. Bon appetit!',
    'Got it. Your food diary is looking thorough.',
    'Tracked. Every bite tells a story.',
    'Noted. Good records make great insights.',
    'Logged. Your nutrition timeline just grew.',
  ],
  hydration: [
    'Sip recorded. Keep it flowing.',
    'Hydration logged. Your cells approve.',
    'Got it. Every drop counts toward your goal.',
    'Tracked. Staying hydrated is an underrated skill.',
    'Logged. Water intake game: strong.',
  ],
  symptoms: [
    'Symptom logged. Knowledge is power.',
    'Recorded. Tracking patterns helps find answers.',
    'Noted. This data helps connect the dots.',
    'Logged. The more you track, the clearer the picture.',
    'Got it. Your health timeline is building.',
  ],
  sleep: [
    'Sleep data logged. Rest well, track better.',
    'Recorded. Quality sleep is quality data.',
    'Got it. Your sleep patterns are taking shape.',
    'Noted. Sweet dreams, solid data.',
    'Logged. Sleep tracking is self-care.',
  ],
  stress: [
    'Stress level captured.',
    'Recorded. Awareness is the first step.',
    'Noted. Tracking stress helps manage it.',
    'Got it. Your body-mind connection is documented.',
    'Logged. You are more than your stress levels.',
  ],
  medication: [
    'Medication logged. Consistency matters.',
    'Got it. Adherence tracked.',
    'Noted. Your medication timeline is up to date.',
    'Logged. Staying on top of your regimen.',
    'Tracked. One less thing to remember.',
  ],
  generic: [
    'Saved successfully.',
    'Entry recorded.',
    'All set.',
    'Done. Looking good.',
    'Captured and stored safely.',
  ],
};

const updateMessages = [
  'Entry updated.',
  'Changes saved.',
  'Updated successfully.',
  'All changes recorded.',
  'Edits saved.',
];

const deleteMessages = [
  'Entry removed.',
  'Deleted successfully.',
  'Gone. Like it was never there.',
  'Removed from your records.',
  'Entry cleared.',
];

const emptyStateMessages: Record<string, { title: string; subtitle: string; hint: string }> = {
  bm: {
    title: 'No entries yet',
    subtitle: 'Your bowel movement log is a blank page, ready for its first chapter.',
    hint: 'Tap "New Entry" above to start building your health record.',
  },
  food: {
    title: 'No meals tracked yet',
    subtitle: 'Your food diary is waiting for its first review.',
    hint: 'Log a meal to start spotting dietary patterns.',
  },
  hydration: {
    title: 'No drinks logged yet',
    subtitle: 'Your hydration timeline is thirsty for data.',
    hint: 'Log your first beverage to start tracking your daily intake.',
  },
  symptoms: {
    title: 'No symptoms recorded',
    subtitle: 'A clean slate. Here is hoping it stays that way.',
    hint: 'If something comes up, log it here to help identify patterns.',
  },
  sleep: {
    title: 'No sleep data yet',
    subtitle: 'Your sleep log is well-rested and waiting.',
    hint: 'Track your first night to start understanding your sleep patterns.',
  },
  stress: {
    title: 'No stress entries',
    subtitle: 'Your stress tracker has nothing to worry about. Yet.',
    hint: 'Log how you are feeling to build awareness over time.',
  },
  medication: {
    title: 'No medications logged',
    subtitle: 'Your medication tracker is standing by.',
    hint: 'Add medications to monitor your adherence and timing.',
  },
  insights: {
    title: 'Your Insights Are Brewing',
    subtitle: 'We need a few days of data to find meaningful patterns. The more you log, the smarter your insights become.',
    hint: 'Try logging across different categories -- meals, symptoms, sleep -- for the richest analysis.',
  },
};

const streakCelebrations: Record<number, string> = {
  3: 'Three days running. You are finding your rhythm.',
  7: 'A full week of tracking. That is real commitment.',
  14: 'Two weeks strong. Your data is starting to tell a story.',
  21: 'Twenty-one days. They say that is how habits form.',
  30: 'One month of consistent tracking. That is impressive dedication.',
  60: 'Two months in. You are a data-driven health champion.',
  90: 'Ninety days. Your health profile is incredibly rich now.',
  100: 'Triple digits. You and GutWise are an unstoppable team.',
  365: 'One full year. Your longitudinal data is genuinely valuable.',
};

const greetings = {
  morning: ['Good morning', 'Rise and shine', 'Morning'],
  afternoon: ['Good afternoon', 'Afternoon', 'Hope your day is going well'],
  evening: ['Good evening', 'Evening', 'Winding down'],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getSuccessMessage(category: string = 'generic'): string {
  return pickRandom(successMessages[category] || successMessages.generic);
}

export function getUpdateMessage(): string {
  return pickRandom(updateMessages);
}

export function getDeleteMessage(): string {
  return pickRandom(deleteMessages);
}

export function getEmptyStateMessage(category: string) {
  return emptyStateMessages[category] || emptyStateMessages.insights;
}

export function getStreakCelebration(days: number): string | null {
  if (streakCelebrations[days]) return streakCelebrations[days];
  const milestones = Object.keys(streakCelebrations).map(Number).sort((a, b) => a - b);
  for (let i = milestones.length - 1; i >= 0; i--) {
    if (days >= milestones[i]) return streakCelebrations[milestones[i]];
  }
  return null;
}

export function getGreeting(): { text: string; period: 'morning' | 'afternoon' | 'evening' } {
  const hour = new Date().getHours();
  if (hour < 12) return { text: pickRandom(greetings.morning), period: 'morning' };
  if (hour < 18) return { text: pickRandom(greetings.afternoon), period: 'afternoon' };
  return { text: pickRandom(greetings.evening), period: 'evening' };
}
