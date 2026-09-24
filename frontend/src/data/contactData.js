// Centralised editable contact content — no real address/phone/email invented.
// Keep business info here only, not scattered in JSX.
export const CONTACT_INFO = {
  locationTitle: 'FIT TRACK GYM',
  locationLines: ['ADDRESS / LOCATION TO BE UPDATED', 'Demo placeholder — real gym address will be added here.'],
  hoursLabel: 'DEMO HOURS',
  hours: [
    { days: 'MON — FRI', time: '06:00 — 22:00' },
    { days: 'SAT — SUN', time: '07:00 — 20:00' },
  ],
  contactTitle: 'PHONE / EMAIL TO BE UPDATED',
  contactLines: ['Demo placeholder — real phone and email will be added here.'],
};

export const ENQUIRY_TYPES = ['Membership', 'Personal Training', 'Programs', 'General Question'];

export const PREFERRED_CONTACTS = ['Email', 'Phone'];

// Future API: POST /api/enquiries with { name, email, phone, enquiryType, preferredContact, message }
export const EMPTY_ENQUIRY = {
  name: '',
  email: '',
  phone: '',
  enquiryType: 'Membership',
  preferredContact: 'Email',
  message: '',
};

export const CONTACT_REASONS = [
  { k: 'MEMBERSHIP', d: 'Questions about plans, duration, or joining.', to: '/membership', cta: 'VIEW PLANS' },
  { k: 'COACHING', d: 'Explore trainers and coaching styles.', to: '/trainers', cta: 'MEET COACHES' },
  { k: 'TRAINING', d: 'Explore available programs.', to: '/programs', cta: 'VIEW PROGRAMS' },
  { k: 'EQUIPMENT', d: 'See the training floor.', to: '/equipment', cta: 'SEE FLOOR' },
];

export const CONTACT_FAQS = [
  {
    q: 'DO I NEED A MEMBERSHIP TO VISIT?',
    a: 'Exact visitor and trial policy will be confirmed by the FIT TRACK team. Use the enquiry form and tell us when you want to visit.',
  },
  {
    q: 'CAN I WORK WITH A TRAINER?',
    a: 'Yes — coaching options can be explored on the Trainers page. Exact availability and scheduling will be confirmed later.',
  },
  {
    q: 'WHICH MEMBERSHIP SHOULD I CHOOSE?',
    a: 'Start with the Membership page and compare the four durations. Longer commitments unlock more coaching support.',
  },
  {
    q: 'CAN I ASK ABOUT A PROGRAM BEFORE JOINING?',
    a: 'Yes. Send an enquiry with type “Programs” and mention your training level — the team will guide you to the right next step.',
  },
];
