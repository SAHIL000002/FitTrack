// Temporary frontend constants for the /home-workout page.
// General fitness guidance only — no medical claims.

export const HW_HERO = {
  headline: 'TRAIN HARD. EVEN FROM HOME.',
  sub: 'A practical training path for people who want to build strength, improve fitness and stay consistent using the equipment they already have.',
  cta: 'START AT BEGINNER LEVEL',
  cta2: 'VIEW TRAINING LEVELS',
  img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop',
  alt: 'Person training with a dumbbell in a compact home space',
};

export const HW_LEVELS = [
  {
    slug: 'beginner', level: 'LEVEL 0', name: 'NO EQUIPMENT',
    equipment: ['None — just floor space'],
    exercises: ['Bodyweight Squat', 'Push-up', 'Knee Push-up', 'Glute Bridge', 'Plank', 'Mountain Climbers', 'Lunges'],
    goal: 'Build movement quality and consistency.',
    freq: '3–4 DAYS / WEEK', duration: 'WEEKS 1–4', style: 'Full-body circuits, 2–3 rounds',
    progression: 'Add 2 reps per exercise each week; full push-ups before knee push-ups.',
    recovery: 'Walk on rest days, stretch 10 minutes after every session.',
    img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000&auto=format&fit=crop',
    alt: 'Person doing a bodyweight workout on a home floor',
  },
  {
    slug: 'basic', level: 'LEVEL 1', name: 'BASIC HOME SETUP',
    equipment: ['Yoga Mat', 'Resistance Bands', 'Light Dumbbells'],
    exercises: ['Goblet Squat', 'Dumbbell Row', 'Shoulder Press', 'Biceps Curl', 'Band Pull Apart', 'Romanian Deadlift'],
    goal: 'Add light external load with controlled technique.',
    freq: '3–4 DAYS / WEEK', duration: 'WEEKS 5–10', style: 'Full-body sessions, 3 sets per exercise',
    progression: 'Move up in small dumbbell jumps; slow the lowering phase for 3 counts.',
    recovery: 'One full rest day between sessions; foam-roll tight areas.',
    img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1000&auto=format&fit=crop',
    alt: 'Person training with light dumbbells at home',
  },
  {
    slug: 'intermediate', level: 'LEVEL 2', name: 'INTERMEDIATE HOME GYM',
    equipment: ['Adjustable Dumbbells', 'Bench', 'Resistance Bands', 'Kettlebell'],
    exercises: ['Bench Press (DB)', 'One-Arm Row', 'Kettlebell Swing', 'Split Squat', 'Incline Press', 'Band Face Pull'],
    goal: 'Structured weekly split with progressive overload.',
    freq: '4 DAYS / WEEK', duration: 'WEEKS 11–20', style: 'Upper / lower split, 3–4 sets',
    progression: 'Track every session — add a rep or a small weight jump each week.',
    recovery: 'Two rest days; keep one mobility-only day.',
    img: 'https://images.unsplash.com/photo-1549476464-37392f717541?q=80&w=1000&auto=format&fit=crop',
    alt: 'Person training with a kettlebell in a home gym corner',
  },
  {
    slug: 'advanced', level: 'LEVEL 3', name: 'ADVANCED HOME GYM',
    equipment: ['Heavy Dumbbells', 'Adjustable Bench', 'Barbell', 'Plates', 'Rack'],
    exercises: ['Barbell Back Squat', 'Barbell Bench Press', 'Deadlift', 'Overhead Press', 'Barbell Row', 'Weighted Lunges'],
    goal: 'Advanced strength-focused routines with structured programming.',
    freq: '5 DAYS / WEEK', duration: 'WEEK 20 ONWARD', style: 'Push / pull / legs + upper / lower blocks',
    progression: 'Percent-based loading (5×5 at 80%) with planned deload every 6th week.',
    recovery: 'Sleep 7–9 hours, deload weeks, dedicated mobility sessions.',
    img: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=1000&auto=format&fit=crop',
    alt: 'Compact home gym setup with a rack and barbell',
  },
];

export const HW_WEEKLY = [
  {
    plan: 'BEGINNER — 3 DAYS', level: 'LEVEL 0–1', color: 'BEGINNER',
    days: [
      { d: 'MONDAY', focus: 'FULL BODY A', items: ['Bodyweight Squat 3×10', 'Push-up 3×8', 'Dumbbell Row 3×10', 'Plank 3×30s'] },
      { d: 'WEDNESDAY', focus: 'FULL BODY B', items: ['Goblet Squat 3×10', 'Shoulder Press 3×10', 'Glute Bridge 3×12', 'Mountain Climbers 3×20s'] },
      { d: 'FRIDAY', focus: 'FULL BODY A', items: ['Lunges 3×8/leg', 'Knee Push-up 3×10', 'Band Pull Apart 3×15', 'Plank 3×30s'] },
    ],
  },
  {
    plan: 'INTERMEDIATE — 4 DAYS', level: 'LEVEL 2', color: 'INTERMEDIATE',
    days: [
      { d: 'MONDAY', focus: 'UPPER BODY', items: ['DB Bench Press 4×8', 'One-Arm Row 4×10', 'Shoulder Press 3×10', 'Band Face Pull 3×15'] },
      { d: 'TUESDAY', focus: 'LOWER BODY', items: ['Goblet Squat 4×10', 'RDL 4×8', 'Split Squat 3×10/leg', 'Calf Raise 3×15'] },
      { d: 'THURSDAY', focus: 'UPPER BODY', items: ['Incline DB Press 4×8', 'Band Pull Down 4×12', 'Biceps Curl 3×12', 'Triceps Extension 3×12'] },
      { d: 'SATURDAY', focus: 'LOWER BODY', items: ['Kettlebell Swing 4×15', 'Bulgarian Split Squat 3×8/leg', 'Glute Bridge 3×15', 'Core Circuit 3 rounds'] },
    ],
  },
  {
    plan: 'ADVANCED — 5 DAYS', level: 'LEVEL 3', color: 'ADVANCED',
    days: [
      { d: 'MONDAY', focus: 'PUSH', items: ['Barbell Bench Press 5×5', 'Overhead Press 4×6', 'Incline DB Press 3×10', 'Triceps 3×12'] },
      { d: 'TUESDAY', focus: 'PULL', items: ['Barbell Row 5×5', 'Weighted Pull-up 4×6', 'One-Arm Row 3×10', 'Face Pull 3×15'] },
      { d: 'WEDNESDAY', focus: 'LEGS', items: ['Back Squat 5×5', 'RDL 4×6', 'Weighted Lunge 3×10/leg', 'Calf Raise 4×12'] },
      { d: 'FRIDAY', focus: 'UPPER', items: ['Incline Bench 4×8', 'Weighted Dip 4×8', 'Row Variation 4×10', 'Arms Superset 3×12'] },
      { d: 'SATURDAY', focus: 'LOWER', items: ['Front Squat 4×6', 'Hip Thrust 4×10', 'Leg Circuit 3 rounds', 'Loaded Carry 3×40m'] },
    ],
  },
];

export const HW_ROADMAP = [
  { stage: 'BEGINNER', steps: ['Movement Basics', 'Consistency', 'Strength Foundation'], detail: 'Learn the patterns. Show up 3 days a week. Add small reps weekly.' },
  { stage: 'INTERMEDIATE', steps: ['Progressive Overload', 'Split Training'], detail: 'Track every session. Move to upper/lower splits with real load jumps.' },
  { stage: 'ADVANCED', steps: ['Structured Programming', 'Performance'], detail: 'Percent-based loading, planned deloads and performance targets.' },
];

export const HW_OVERLOAD = {
  intro: 'Progressive overload is simple: make the workout slightly harder over time. One variable at a time.',
  methods: ['Increase reps', 'Increase weight', 'Improve form', 'Increase sets', 'Reduce unnecessary rest where appropriate'],
  example: [
    { w: 'WEEK 1', v: '3 × 8' }, { w: 'WEEK 2', v: '3 × 10' },
    { w: 'WEEK 3', v: '3 × 12' }, { w: 'WEEK 4', v: 'Add weight → 3 × 8' },
  ],
};

export const HW_RECOVERY = [
  { k: 'REST DAYS', d: 'At least 1–2 full rest days per week. Light walking is fine.' },
  { k: 'SLEEP', d: '7–9 hours. Most adaptation happens while you sleep.' },
  { k: 'HYDRATION', d: 'Drink water through the day, not just during workouts.' },
  { k: 'WARM-UP', d: '5–10 minutes of joint prep and easy reps before every session.' },
  { k: 'COOLDOWN', d: '5 minutes of easy movement and stretching after training.' },
  { k: 'MOBILITY', d: 'One short mobility block on rest days keeps joints happy.' },
  { k: 'GRADUAL PROGRESSION', d: 'Never jump weights or volume aggressively — small steps add up.' },
];

export const HW_SAFETY = [
  'Start at a manageable level.',
  'Prioritize correct form over load.',
  'Stop if an exercise causes sharp or unusual pain.',
  'Use appropriate space and equipment.',
  'Beginners should start with manageable loads.',
  'Consult a qualified professional if you have an injury or medical concern.',
];

export const HW_FAQ = [
  { q: 'Do I need equipment?', a: 'No — Level 0 uses only bodyweight. Every level tells you exactly what you need before you start.' },
  { q: 'How many days per week?', a: '3 to 5 days depending on level. Rest days are part of the plan, not an optional extra.' },
  { q: 'Can beginners follow this?', a: 'Yes. Start at Level 0 and move up only when the current level feels manageable.' },
  { q: 'What if I miss a day?', a: 'Continue where you left off. Consistency matters more than perfection.' },
];
export const HW_FAQ_NOTE = 'General fitness guidance only — not medical advice.';
