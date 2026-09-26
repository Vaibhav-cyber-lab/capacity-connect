import { GamificationStats, Badge, Flashcard, CheatSheet, QuickNote } from '../types';

export const initialBadges: Badge[] = [
  {
    id: 'badge_1',
    title: 'First Step',
    description: 'Enrolled in your first course and began the journey',
    icon: '🎯',
    category: 'course',
    unlocked: true,
    unlockedAt: '2026-09-15',
  },
  {
    id: 'badge_2',
    title: '5-Day Streak',
    description: 'Studied consistently for 5 consecutive days',
    icon: '🔥',
    category: 'streak',
    unlocked: true,
    unlockedAt: '2026-09-18',
  },
  {
    id: 'badge_3',
    title: 'Quiz Prodigy',
    description: 'Scored 90%+ on any interactive practice assessment',
    icon: '🧠',
    category: 'quiz',
    unlocked: true,
    unlockedAt: '2026-09-17',
  },
  {
    id: 'badge_4',
    title: 'Speed Demon',
    description: 'Finished a practice quiz with more than 50% time left',
    icon: '⚡',
    category: 'quiz',
    unlocked: false,
  },
  {
    id: 'badge_5',
    title: 'Flashcard Master',
    description: 'Mastered at least 10 core flashcards',
    icon: '🃏',
    category: 'special',
    unlocked: false,
  },
  {
    id: 'badge_6',
    title: 'AI Scholar',
    description: 'Interacted with the AI Tutor to solve deep academic doubts',
    icon: '✨',
    category: 'special',
    unlocked: true,
    unlockedAt: '2026-09-18',
  },
];

export const initialGamificationStats: GamificationStats = {
  streakDays: 5,
  bestStreak: 12,
  lastCheckInDate: new Date().toISOString().split('T')[0],
  hasCheckedInToday: true,
  xp: 520,
  level: 3,
  levelTitle: 'Rising Scholar',
  nextLevelXp: 750,
  dailyGoalMinutes: 45,
  todayMinutesStudied: 38,
  completedQuizzesCount: 6,
  averageScorePercent: 88,
  badges: initialBadges,
  weeklyActivity: [
    { day: 'Mon', hours: 1.5, target: 1.0 },
    { day: 'Tue', hours: 2.0, target: 1.0 },
    { day: 'Wed', hours: 0.8, target: 1.0 },
    { day: 'Thu', hours: 2.4, target: 1.0 },
    { day: 'Fri', hours: 1.8, target: 1.0 },
    { day: 'Sat', hours: 3.2, target: 1.5 },
    { day: 'Sun', hours: 2.5, target: 1.5 },
  ],
};

export const initialFlashcards: Flashcard[] = [
  {
    id: 'fc_1',
    category: 'Web Development',
    front: 'What is the Virtual DOM in React and why is it fast?',
    back: 'An in-memory lightweight representation of the real DOM. React computes differences (reconciliation diffing) and batches updates to minimize expensive browser repaints.',
    difficulty: 'Easy',
    mastered: true,
  },
  {
    id: 'fc_2',
    category: 'Web Development',
    front: 'Explain the difference between useEffect and useLayoutEffect',
    back: 'useEffect runs asynchronously after the render is committed to screen. useLayoutEffect runs synchronously immediately after DOM mutations, before browser paint, preventing visual flickers.',
    codeSnippet: 'useLayoutEffect(() => {\n  const { height } = ref.current.getBoundingClientRect();\n}, []);',
    difficulty: 'Medium',
    mastered: false,
  },
  {
    id: 'fc_3',
    category: 'AI & Data Science',
    front: 'What is Temperature in Large Language Models (LLMs)?',
    back: 'A hyperparameter controlling randomness in output token generation. Values closer to 0 make predictions deterministic and focused, while values closer to 1 promote creativity and diversity.',
    difficulty: 'Easy',
    mastered: true,
  },
  {
    id: 'fc_4',
    category: 'AI & Data Science',
    front: 'What is the vanishing gradient problem in deep neural networks?',
    back: 'During backpropagation, gradients calculated by the chain rule diminish exponentially in earlier layers, preventing weights from updating. Addressed by ReLU, Residual connections (ResNets), and Batch Normalization.',
    difficulty: 'Hard',
    mastered: false,
  },
  {
    id: 'fc_5',
    category: 'Leadership & Strategy',
    front: 'What are SMART goals and how do they impact execution?',
    back: 'Specific, Measurable, Achievable, Relevant, and Time-bound. They eliminate ambiguity, provide quantitative milestones, and align cross-functional team efforts.',
    difficulty: 'Easy',
    mastered: true,
  },
  {
    id: 'fc_6',
    category: 'Web Development',
    front: 'What does Tailwind CSS v4 @custom-variant dark do?',
    back: 'Allows creating custom variant selectors. When configured with (&:where(.dark, .dark *)), it enables class-based dark mode toggling by looking for the .dark class on ancestor elements.',
    codeSnippet: '@custom-variant dark (&:where(.dark, .dark *));',
    difficulty: 'Medium',
    mastered: false,
  },
  {
    id: 'fc_7',
    category: 'Finance & Planning',
    front: 'What is Working Capital and how is it calculated?',
    back: 'Current Assets minus Current Liabilities. It measures short-term financial health, operational liquidity, and ability to cover near-term debt obligations.',
    difficulty: 'Medium',
    mastered: false,
  },
  {
    id: 'fc_8',
    category: 'AI & Data Science',
    front: 'What is RAG (Retrieval-Augmented Generation)?',
    back: 'An architectural pattern that retrieves relevant external documents via vector embeddings and injects them into the LLM prompt context to provide grounded, up-to-date, and hallucination-resistant answers.',
    difficulty: 'Medium',
    mastered: true,
  },
];

export const initialCheatSheets: CheatSheet[] = [
  {
    id: 'cs_1',
    title: 'Modern React 19 & TypeScript Quick Reference',
    category: 'Web Development',
    description: 'Essential hooks, type signatures, and state management patterns for enterprise React apps.',
    tags: ['React 19', 'TypeScript', 'Hooks', 'State'],
    readTime: '4 min read',
    content: `### React Hooks Essentials
- **useState<T>(initial)**: Reactive component state.
- **useEffect(fn, deps)**: Side-effects after paint. Use primitive dependencies.
- **useMemo(() => compute, deps)**: Memoize expensive calculations.
- **useCallback(fn, deps)**: Stabilize callback references passed to memoized children.
- **useRef<HTMLDivElement>(null)**: Mutable reference without re-renders.

\`\`\`tsx
// Custom Hook Pattern
export function useLocalStorage<T>(key: string, initial: T) {
  const [val, setVal] = useState<T>(() => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initial;
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(val));
  }, [key, val]);
  return [val, setVal] as const;
}
\`\`\`

### Props & Component Types
\`\`\`tsx
interface CardProps {
  title: string;
  count: number;
  isActive?: boolean;
  onAction: (id: string) => void;
  children?: React.ReactNode;
}
\`\`\``,
  },
  {
    id: 'cs_2',
    title: 'Gemini 3.8 Flash & Prompt Engineering Guide',
    category: 'AI & Data Science',
    description: 'Key API methods, system instructions, structured output tips, and best practices.',
    tags: ['Gemini AI', 'GenAI SDK', 'LLM', 'Prompts'],
    readTime: '5 min read',
    content: `### GenAI SDK Initialization (Server-Side)
\`\`\`ts
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const response = await ai.models.generateContent({
  model: 'gemini-3.8-flash',
  contents: 'Summarize quantum computing in 3 bullets',
  config: {
    systemInstruction: 'You are an expert tutor.',
  },
});
console.log(response.text);
\`\`\`

### High-Impact Prompting Patterns
1. **Persona & Goal**: "Act as a senior mentor explaining to a beginner."
2. **Step-by-Step Chain**: "First define the term, second provide a 3-line code sample, third explain common gotchas."
3. **Strict Constraints**: "Answer within 120 words. Do not use buzzwords."
4. **Structured JSON Output**: Always provide the target TypeScript interface or schema in the prompt.`,
  },
  {
    id: 'cs_3',
    title: 'Algorithms & Time Complexity Cheat Sheet',
    category: 'Computer Science',
    description: 'Big-O notation, common data structure lookups, sorting efficiency, and search algorithms.',
    tags: ['Big-O', 'Data Structures', 'Sorting', 'Search'],
    readTime: '3 min read',
    content: `### Big-O Notation Hierarchy
- **O(1)**: Constant — Hash map lookup, array index access.
- **O(log N)**: Logarithmic — Binary search on sorted array.
- **O(N)**: Linear — Array iteration, string scan.
- **O(N log N)**: Linearithmic — Merge sort, Quick sort (average), Tim sort.
- **O(N²)**: Quadratic — Nested loops, Bubble sort.
- **O(2ⁿ)**: Exponential — Naive recursive Fibonacci.

### Data Structure Operations
| Structure | Access | Search | Insert | Delete |
|-----------|--------|--------|--------|--------|
| Array     | O(1)   | O(N)   | O(N)   | O(N)   |
| Hash Table| N/A    | O(1)   | O(1)   | O(1)   |
| BST (Bal) | O(logN)| O(logN)| O(logN)| O(logN)|
| Stack/Queue| O(N)  | O(N)   | O(1)   | O(1)   |`,
  },
  {
    id: 'cs_4',
    title: 'High-Performance Tailwind CSS Patterns',
    category: 'Design & UI',
    description: 'Responsive utilities, flexbox/grid alignments, dark mode classes, and animation tips.',
    tags: ['Tailwind', 'CSS', 'Flexbox', 'Grid', 'Responsive'],
    readTime: '3 min read',
    content: `### Responsive Layout Grid
\`\`\`html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
  <!-- Responsive Card Content -->
</div>
\`\`\`

### Dark Mode Synergy
- Background: \`bg-white dark:bg-slate-900\`
- Border: \`border-slate-200 dark:border-slate-800\`
- Text: \`text-slate-900 dark:text-slate-100\`
- Secondary Text: \`text-slate-500 dark:text-slate-400\`
- Card Hover: \`hover:border-slate-300 dark:hover:border-slate-700\`

### Centering & Truncating
- Flex center: \`flex items-center justify-center\`
- Single line truncate: \`truncate block\`
- Two line clamp: \`line-clamp-2\``,
  },
];

export const initialQuickNotes: QuickNote[] = [
  {
    id: 'qn_1',
    title: 'Core Fundamentals of Machine Learning',
    category: 'AI & Data Science',
    readTime: '3 min',
    keyPoints: [
      'Supervised Learning: Trained on labeled input-output pairs (Classification, Regression).',
      'Unsupervised Learning: Discovers hidden patterns in unlabeled data (Clustering, PCA).',
      'Reinforcement Learning: Agent learns via environment rewards and penalties.',
      'Overfitting vs Underfitting: Balanced via regularizers (L1/L2), dropout, and cross-validation.',
    ],
    summary: 'Machine learning automates analytical model building using data-driven statistical algorithms instead of explicit hard-coded procedural logic.',
  },
  {
    id: 'qn_2',
    title: 'Effective Leadership & Delegation Frameworks',
    category: 'Management',
    readTime: '2 min',
    keyPoints: [
      'Situational Leadership: Directing, Coaching, Supporting, and Delegating based on maturity.',
      'Psychological Safety: Teams thrive when mistakes are treated as learning opportunities.',
      'Active Listening: Paraphrasing, withholding judgment, and identifying non-verbal cues.',
      'Feedback Loops: Frequent, specific, and actionable 1-on-1 check-ins.',
    ],
    summary: 'Modern leadership emphasizes emotional intelligence, high context over high control, and empowering team ownership to foster autonomous execution.',
  },
  {
    id: 'qn_3',
    title: 'REST vs GraphQL vs gRPC Architectural Overview',
    category: 'Web Development',
    readTime: '3 min',
    keyPoints: [
      'REST: HTTP verbs, standard status codes, cacheable, but can lead to over/under-fetching.',
      'GraphQL: Single endpoint, client requests exact fields, great for complex nested graphs.',
      'gRPC: Protocol Buffers, HTTP/2 multiplexing, strongly-typed contracts, ultra-fast internal microservices.',
    ],
    summary: 'Choose REST for public APIs and simplicity, GraphQL for multi-client dashboards with flexible query needs, and gRPC for high-throughput internal microservice communication.',
  },
];

const GAMIFICATION_KEY = 'smart_ed_gamification';
const FLASHCARDS_KEY = 'smart_ed_flashcards';

export function getStoredGamification(): GamificationStats {
  try {
    const raw = localStorage.getItem(GAMIFICATION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Auto verify streak on load
      const today = new Date().toISOString().split('T')[0];
      if (parsed.lastCheckInDate !== today) {
        parsed.hasCheckedInToday = false;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load gamification stats', e);
  }
  return initialGamificationStats;
}

export function saveStoredGamification(stats: GamificationStats): void {
  try {
    localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save gamification stats', e);
  }
}

export function getStoredFlashcards(): Flashcard[] {
  try {
    const raw = localStorage.getItem(FLASHCARDS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load flashcards', e);
  }
  return initialFlashcards;
}

export function saveStoredFlashcards(cards: Flashcard[]): void {
  try {
    localStorage.setItem(FLASHCARDS_KEY, JSON.stringify(cards));
  } catch (e) {
    console.error('Failed to save flashcards', e);
  }
}
