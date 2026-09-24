// Detailed day-by-day plans for each Home Workout level.
// Driven by /home-workout/:level — not medical advice, general fitness guidance only.

function ex(name, sets, reps, rest, equipment, focus) {
  return { name, sets, reps, rest, equipment, focus };
}

export const HW_PLANS = {
  beginner: {
    slug: 'beginner',
    level: 'LEVEL 0',
    name: 'HOME FITNESS FOUNDATION',
    difficulty: 'BEGINNER',
    duration: '4 WEEKS',
    frequency: '3 DAYS / WEEK',
    equipment: 'NONE',
    goal: 'BUILD CONSISTENCY',
    tagline: 'Start from zero. Learn the basic movement patterns with nothing but your body and floor space.',
    overview: 'A 4-week beginner plan using zero equipment. Three full-body sessions per week on non-consecutive days. Focus is on learning correct form, building the habit of showing up, and slowly increasing reps. No rush — consistency beats intensity.',
    warmup: ['March in Place — 30 sec', 'Arm Circles — 30 sec each direction', 'Bodyweight Squat — 10 reps', 'Hip Hinge — 10 reps', 'Light Mobility — 2–3 min'],
    cooldown: ['Walk in Place — 1 min', 'Standing Forward Fold — 30 sec', 'Quad Stretch — 30 sec each leg', 'Deep Breathing — 1 min'],
    weeks: [
      { week: 'WEEK 1', title: 'LEARN THE MOVEMENTS', note: 'Focus on form. Do not rush. Stop if form breaks down.' },
      { week: 'WEEK 2', title: 'INCREASE REPETITIONS', note: 'Add 2 reps to each exercise where form is clean.' },
      { week: 'WEEK 3', title: 'ADD ONE SET', note: 'Add one extra set to squats, push-ups, and planks.' },
      { week: 'WEEK 4', title: 'IMPROVE CONTROL + PROGRESS', note: 'Slow the lowering phase. Full push-ups if knee push-ups are easy.' },
    ],
    schedule: [
      { day: 'MONDAY', status: 'WORKOUT', focus: 'FULL BODY A', exercises: [ex('Bodyweight Squat', 3, '10', '60–90 SEC', 'NONE', 'Chest up, knees track over toes.'), ex('Knee Push-up', 3, '8', '60–90 SEC', 'NONE', 'Controlled tempo, elbows at 45 degrees.'), ex('Glute Bridge', 3, '12', '45 SEC', 'NONE', 'Drive through heels, squeeze glutes at top.'), ex('Plank', 3, '20 SEC', '45 SEC', 'NONE', 'Keep body in a straight line, breathe steadily.'), ex('Mountain Climbers', 3, '20 SEC', '60 SEC', 'NONE', 'Controlled pace, core engaged.')] },
      { day: 'TUESDAY', status: 'REST', focus: 'REST DAY', recovery: 'Light walking and gentle stretching. Let your body recover.' },
      { day: 'WEDNESDAY', status: 'WORKOUT', focus: 'FULL BODY B', exercises: [ex('Reverse Lunge', 3, '8 / LEG', '60 SEC', 'NONE', 'Upright torso, front knee stays over ankle.'), ex('Incline Push-up', 3, '10', '60–90 SEC', 'NONE', 'Use a chair or wall for incline.'), ex('Glute Bridge', 3, '12', '45 SEC', 'NONE', 'Add a 2-second hold at the top.'), ex('Dead Bug', 3, '8 / SIDE', '45 SEC', 'NONE', 'Keep lower back pressed to floor.'), ex('Bodyweight Squat', 3, '10', '60 SEC', 'NONE', 'Slow and controlled.')] },
      { day: 'THURSDAY', status: 'REST', focus: 'REST / MOBILITY', recovery: '10–15 minutes of mobility work. Focus on hips, shoulders, and spine.' },
      { day: 'FRIDAY', status: 'WORKOUT', focus: 'FULL BODY A', exercises: [ex('Bodyweight Squat', 3, '10–12', '60–90 SEC', 'NONE', 'Add 1–2 reps from Monday.'), ex('Knee Push-up', 3, '8–10', '60–90 SEC', 'NONE', 'Slow the lowering phase for 3 counts.'), ex('Walking Lunge', 3, '8 / LEG', '60 SEC', 'NONE', 'Add travel if space allows.'), ex('Plank', 3, '25 SEC', '45 SEC', 'NONE', 'Hold slightly longer than Monday.'), ex('Glute Bridge', 3, '12–15', '45 SEC', 'NONE', 'Squeeze glutes hard at the top.')] },
      { day: 'SATURDAY', status: 'OPTIONAL', focus: 'OPTIONAL WALK OR MOBILITY', recovery: '20–30 minute walk or full mobility session. Not required.' },
      { day: 'SUNDAY', status: 'REST', focus: 'FULL REST', recovery: 'Complete rest. Sleep well, hydrate, prepare for next week.' },
    ],
    progression: 'If you complete all reps with good form, move to the next week targets. Repeat a week if the current one feels too challenging.',
  },

  basic: {
    slug: 'basic', level: 'LEVEL 1', name: 'BASIC HOME SETUP', difficulty: 'BEGINNER TO INTERMEDIATE',
    duration: '4 WEEKS', frequency: '3–4 DAYS / WEEK', equipment: 'BANDS / LIGHT DUMBBELLS / MAT', goal: 'ADD LOAD',
    tagline: 'Add real load while keeping technique sharp.',
    overview: 'Three full-body sessions per week. Start lighter than you think. Build up gradually.',
    warmup: ['March in Place — 30 sec', 'Band Pull Apart — 10', 'Squat — 10', 'Hinge — 10'],
    cooldown: ['Walk — 1 min', 'Hamstring Stretch — 30 sec/leg', 'Breathing — 1 min'],
    weeks: [
      { week: 'WEEK 1', title: 'LEARN THE LOAD', note: 'Lightest dumbbells. Technique first.' },
      { week: 'WEEK 2', title: 'ADD REPS', note: 'Add 2 reps where form is solid.' },
      { week: 'WEEK 3', title: 'ADD SETS', note: 'One extra set to main lifts.' },
      { week: 'WEEK 4', title: 'PROGRESS LOAD', note: 'Small dumbbell jumps where comfortable.' },
    ],
    schedule: [
      { day: 'MONDAY', status: 'WORKOUT', focus: 'FULL BODY', exercises: [ex('Goblet Squat',3,'10','90s','DB','Hold at chest, squat deep'),ex('Dumbbell Row',3,'10','60s','DB','Brace knee, pull to hip'),ex('Shoulder Press',3,'10','60s','DB','Core tight'),ex('RDL',3,'10','60s','DB','Hinge at hips'),ex('Plank',3,'30s','45s','MAT','Steady breathing')] },
      { day: 'TUESDAY', status: 'REST', focus: 'REST', recovery: 'Light walking. Stretch tight areas.' },
      { day: 'WEDNESDAY', status: 'WORKOUT', focus: 'FULL BODY', exercises: [ex('Reverse Lunge',3,'10/leg','60s','DB','Step back into lunge'),ex('Floor Press',3,'10','60s','DB','Lie on floor, press up'),ex('Band Pull Apart',3,'15','45s','BAND','Squeeze blades'),ex('Biceps Curl',3,'12','45s','DB','No swinging'),ex('Glute Bridge',3,'15','45s','MAT','DB on hips if ready')] },
      { day: 'THURSDAY', status: 'REST', focus: 'MOBILITY', recovery: '15-min mobility. Hips and shoulders.' },
      { day: 'FRIDAY', status: 'WORKOUT', focus: 'FULL BODY', exercises: [ex('Goblet Squat',3,'10-12','90s','DB','Add reps or weight'),ex('One-Arm Row',3,'10/arm','60s','DB','Squeeze lats'),ex('Shoulder Press',3,'10-12','60s','DB','Full range'),ex('RDL',3,'10-12','60s','DB','Deepen hinge'),ex('Mountain Climbers',3,'30s','45s','MAT','Steady pace')] },
      { day: 'SATURDAY', status: 'OPTIONAL', focus: 'MOBILITY/CARDIO', recovery: '20-min walk or mobility.' },
      { day: 'SUNDAY', status: 'REST', focus: 'FULL REST', recovery: 'Rest and recover.' },
    ],
    progression: 'Add weight only when all reps are clean. Add a set before adding weight.',
  },

  intermediate: {
    slug: 'intermediate', level: 'LEVEL 2', name: 'INTERMEDIATE HOME GYM', difficulty: 'INTERMEDIATE',
    duration: '4 WEEKS', frequency: '4 DAYS / WEEK', equipment: 'DB/BENCH/BANDS/KB', goal: 'SPLIT TRAINING',
    tagline: 'Upper/lower split with real load. Track every session.',
    overview: 'Mon/Thu upper, Tue/Sat lower. Wed optional mobility. Fri/Sun rest.',
    warmup: ['March — 30s', 'Band Pull Apart — 10', 'Light Press — 10', 'Squat — 10'],
    cooldown: ['Walk — 1 min', 'Full Stretch — 3 min'],
    weeks: [
      { week: 'WEEK 1', title: 'BASELINE', note: 'Find working weights. Last rep challenging.' },
      { week: 'WEEK 2', title: 'ADD REPS', note: '1-2 more reps per exercise.' },
      { week: 'WEEK 3', title: 'ADD SETS', note: 'Extra set to main lifts.' },
      { week: 'WEEK 4', title: 'ADD LOAD', note: 'Small weight jumps where comfortable.' },
    ],
    schedule: [
      { day: 'MONDAY', status: 'WORKOUT', focus: 'UPPER', exercises: [ex('DB Bench Press',4,'8-10','90s','DB/BENCH','Elbows 45deg'),ex('One-Arm Row',4,'8-10','60s','DB','Squeeze lats'),ex('Shoulder Press',3,'10','60s','DB','Overhead'),ex('Lateral Raise',3,'12','45s','DB','Control weight'),ex('Biceps Curl',3,'12','45s','DB','No swing'),ex('Triceps Ext',3,'12','45s','DB','Elbows in')] },
      { day: 'TUESDAY', status: 'WORKOUT', focus: 'LOWER', exercises: [ex('Goblet Squat',4,'10','90s','DB','Deep squat'),ex('RDL',4,'8','60s','DB','Deep hinge'),ex('Split Squat',3,'10/leg','60s','DB','Upright'),ex('Calf Raise',3,'15','45s','DB','Full range'),ex('Core Circuit',3,'3 rds','45s','MAT','Plank,DeadBug,Bridge')] },
      { day: 'WEDNESDAY', status: 'OPTIONAL', focus: 'MOBILITY/CARDIO', recovery: '15-20 min optional.' },
      { day: 'THURSDAY', status: 'WORKOUT', focus: 'UPPER', exercises: [ex('Incline DB Press',4,'8-10','90s','DB/BENCH','30-45deg'),ex('Band Pull Down',4,'12','60s','BAND','Anchor high'),ex('Seated Press',3,'10','60s','DB/BENCH','Seated'),ex('Band Face Pull',3,'15','45s','BAND','Rear delts'),ex('Hammer Curl',3,'12','45s','DB','Neutral grip'),ex('OH Tri Ext',3,'12','45s','DB','Both hands')] },
      { day: 'FRIDAY', status: 'REST', focus: 'REST', recovery: 'Light walking.' },
      { day: 'SATURDAY', status: 'WORKOUT', focus: 'LOWER', exercises: [ex('KB Swing',4,'15','60s','KB','Hip hinge snap'),ex('Bulgarian SS',3,'8/leg','60s','DB/BENCH','Back foot up'),ex('Glute Bridge',3,'15','45s','MAT','DB on hips'),ex('Farmer Carry',3,'40m','60s','DB','Core tight')] },
      { day: 'SUNDAY', status: 'REST', focus: 'FULL REST', recovery: 'Sleep 7-9 hours.' },
    ],
    progression: 'Track every session. Add rep or weight weekly. Deload every 4th week.',
  },

  advanced: {
    slug: 'advanced', level: 'LEVEL 3', name: 'ADVANCED HOME GYM', difficulty: 'ADVANCED',
    duration: '4 WEEKS', frequency: '5 DAYS / WEEK', equipment: 'BARBELL/PLATES/RACK/BENCH', goal: 'STRENGTH',
    tagline: 'Push/pull/legs + upper/lower. Percent-based loading.',
    overview: 'PPL + upper/lower. Heavy compounds. Planned deload Week 4.',
    warmup: ['March — 30s', 'Barbell Complex — 5', 'Empty Squat — 10', 'Band Pull Apart — 10', 'Light Bench — 10'],
    cooldown: ['Walk — 1 min', 'Full Stretch — 3 min'],
    weeks: [
      { week: 'WEEK 1', title: 'BASELINE', note: 'Find working weights.' },
      { week: 'WEEK 2', title: 'ADD', note: '+1 rep or +2.5kg to main lifts.' },
      { week: 'WEEK 3', title: 'PEAK', note: 'Small PRs if form solid.' },
      { week: 'WEEK 4', title: 'DELOAD', note: 'Reduce loads 40-50pct.' },
    ],
    schedule: [
      { day: 'MONDAY', status: 'WORKOUT', focus: 'PUSH', exercises: [ex('Bench Press',5,'5','2-3m','BARBELL','Touch chest'),ex('OHP',4,'6','2m','BARBELL','Strict'),ex('Incline DB',3,'10','90s','DB','30deg'),ex('Lateral Raise',3,'12','45s','DB','Control'),ex('Tri Pushdown',3,'12','45s','BAND','Extend fully')] },
      { day: 'TUESDAY', status: 'WORKOUT', focus: 'PULL', exercises: [ex('Barbell Row',5,'5','2-3m','BARBELL','Hinge, pull to chest'),ex('Weighted Pull-up',4,'6','2m','DB','DB between legs'),ex('One-Arm Row',3,'10/arm','60s','DB','Control negative'),ex('Face Pull',3,'15','45s','BAND','Rear delts'),ex('BB Curl',3,'12','45s','BARBELL','Strict')] },
      { day: 'WEDNESDAY', status: 'WORKOUT', focus: 'LEGS', exercises: [ex('Back Squat',5,'5','2-3m','BARBELL','Below parallel'),ex('RDL',4,'6','2m','BARBELL','Deep hinge'),ex('Weighted Lunge',3,'10/leg','90s','DB','At sides'),ex('Calf Raise',4,'12','45s','DB','Pause top/bottom')] },
      { day: 'THURSDAY', status: 'REST', focus: 'MOBILITY', recovery: '20-min mobility.' },
      { day: 'FRIDAY', status: 'WORKOUT', focus: 'UPPER', exercises: [ex('Incline BB',4,'8','2m','BARBELL','30-45deg'),ex('Weighted Dip',4,'8','90s','DB','Lean forward'),ex('Chest Row',4,'10','60s','DB/BENCH','Face down'),ex('Seated Press',3,'10','60s','DB','Seated'),ex('Arm SS',3,'12','45s','DB','Curl+Ext')] },
      { day: 'SATURDAY', status: 'WORKOUT', focus: 'LOWER', exercises: [ex('Front Squat',4,'6','2m','BARBELL','Upright torso'),ex('Hip Thrust',4,'10','90s','BARBELL/BENCH','Drive heels'),ex('Leg Circuit',3,'3 rds','60s','DB','Lunge,Squat,Calf'),ex('Loaded Carry',3,'40m','60s','DB','Core tight')] },
      { day: 'SUNDAY', status: 'REST', focus: 'FULL REST', recovery: 'Sleep 7-9 hours.' },
    ],
    progression: 'Percent-based. +2.5kg when sets completed. Deload Week 4. Form over weight.',
  },
};

export function getPlanBySlug(slug) {
  return HW_PLANS[slug] || null;
}

export const HW_LEVEL_ORDER = ['beginner', 'basic', 'intermediate', 'advanced'];

export function getAdjacentLevels(slug) {
  const i = HW_LEVEL_ORDER.indexOf(slug);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: i > 0 ? HW_LEVEL_ORDER[i - 1] : null,
    next: i < HW_LEVEL_ORDER.length - 1 ? HW_LEVEL_ORDER[i + 1] : null,
  };
}