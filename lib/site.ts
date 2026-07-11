/**
 * Single source of truth for all practice details shown on the site.
 * Everything here is PLACEHOLDER content — replace with the real
 * physiotherapist's details before launch (see docs/phase-1-notes.md).
 */

export const site = {
  /** Practice / brand */
  name: "Restore Physiotherapy",
  tagline: "Move better. Live pain-free.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  /** The physiotherapist */
  doctor: {
    name: "Dr. Preeti Sahu (PT)",
    shortName: "Dr. Preeti",
    credentials: "BPT, MPT (Neuroscience)",
    registrationNumber: "IAP Reg. No. XXXXX", // TODO: real registration number
    experienceYears: 2,
    specializations: [
      "Back & neck pain",
      "Sports injury rehabilitation",
      "Post-surgical rehabilitation",
      "Posture & ergonomics",
    ],
  },

  /** Contact */
  phone: "+91 98765 43210", // TODO: real phone
  whatsappNumber: "919876543210", // digits only, country code first — TODO: real number
  contactEmail: "hello@example.com", // TODO: real email (also used as contact-form recipient)

  /** UPI ID for manual-mode consultation payments — TODO: real VPA (e.g. name@okhdfcbank) */
  upiId: "restore.physio@okaxis",

  /** Clinic */
  address: {
    line1: "2nd Floor, Wellness Plaza",
    line2: "MG Road, Raipur, Chhattisgarh 492001",
    /** Query used for the Google Maps embed + directions link */
    mapsQuery: "Wellness Plaza MG Road Raipur",
  },
  hours: [
    { days: "Monday – Saturday", time: "9:00 AM – 1:00 PM" },
    { days: "Monday – Saturday", time: "4:00 PM – 8:00 PM" },
    { days: "Sunday", time: "Closed" },
  ],

  /** Promise shown on the online-consultation flow */
  replyPromise: "Replies within 24 hours, Mon–Sat",
} as const;

export type Service = {
  slug: string;
  name: string;
  mode: "clinic" | "home_visit" | "chat";
  priceInr: number;
  duration: string;
  summary: string;
  details: string[];
};

export const services: Service[] = [
  {
    slug: "back-neck-pain",
    name: "Back & Neck Pain Treatment",
    mode: "clinic",
    priceInr: 700,
    duration: "45 min session",
    summary:
      "Assessment and hands-on treatment for chronic back pain, cervical pain, sciatica and disc-related problems.",
    details: [
      "Detailed postural and movement assessment on your first visit",
      "Manual therapy, mobilisation and targeted strengthening",
      "A home exercise plan you can actually follow",
      "Guidance on desk setup, sleep posture and daily habits",
    ],
  },
  {
    slug: "sports-injury",
    name: "Sports Injury Rehabilitation",
    mode: "clinic",
    priceInr: 800,
    duration: "45 min session",
    summary:
      "Structured rehab for ligament sprains, muscle tears, runner's knee, tennis elbow and return-to-sport conditioning.",
    details: [
      "Sport-specific assessment and rehab planning",
      "Progressive loading to get you back to play safely",
      "Taping, strength and mobility work as needed",
      "Clear milestones so you know when you're ready to return",
    ],
  },
  {
    slug: "post-surgical",
    name: "Post-Surgical Rehabilitation",
    mode: "clinic",
    priceInr: 800,
    duration: "45 min session",
    summary:
      "Recovery programs after knee replacement, ACL reconstruction, fracture fixation and spinal surgery.",
    details: [
      "Rehab protocol coordinated with your surgeon's advice",
      "Safe, phase-wise progression of movement and strength",
      "Swelling, scar and pain management",
      "Regular progress reviews with measurable goals",
    ],
  },
  {
    slug: "home-visit",
    name: "Home Visit Physiotherapy",
    mode: "home_visit",
    priceInr: 1200,
    duration: "60 min visit",
    summary:
      "Clinic-quality physiotherapy at your home — ideal for elderly patients, post-surgery recovery and limited mobility.",
    details: [
      "Full assessment and treatment at your doorstep",
      "Portable equipment brought along as needed",
      "Family members guided on safe assistance",
      "Available within city limits, slots confirmed on booking",
    ],
  },
  {
    slug: "online-consultation",
    name: "Online Chat Consultation",
    mode: "chat",
    priceInr: 499,
    duration: "Private chat thread",
    summary: `Describe your problem, share photos or reports, and get professional guidance from ${site.doctor.shortName} — from anywhere.`,
    details: [
      "Share your problem, pain areas and reports privately",
      site.replyPromise,
      "Personalised advice and exercise guidance",
      "Follow-up consultation at a reduced price (₹299)",
    ],
  },
];

export const testimonials = [
  {
    name: "Ramesh K.",
    context: "Chronic lower back pain",
    quote:
      "After two months of sessions my back pain is almost gone. She explains everything clearly and the exercises were easy to follow at home.",
  },
  {
    name: "Sneha P.",
    context: "ACL rehab",
    quote:
      "I was scared I'd never run again after my ACL surgery. The step-by-step rehab plan got me back on the track in seven months.",
  },
  {
    name: "Vijay S.",
    context: "Home visits for father",
    quote:
      "Home visits for my 78-year-old father after his hip surgery were a blessing. Punctual, patient and very professional.",
  },
];

export const faqs = [
  {
    question: "Do I need a doctor's referral to see a physiotherapist?",
    answer:
      "No referral is needed. You can book directly. If you have prescriptions, scans or reports, bring them along — they help with assessment.",
  },
  {
    question: "How does the online chat consultation work?",
    answer: `You pay online, describe your problem in a short form, and attach photos or reports if you have them. ${site.doctor.shortName} replies in a private chat thread — typically within 24 hours (Mon–Sat) — with her assessment and guidance. It's ideal for advice, exercise guidance and second opinions. It does not replace a physical examination where one is needed, and she'll tell you honestly if a clinic visit is necessary.`,
  },
  {
    question: "What should I wear or bring to my first clinic visit?",
    answer:
      "Wear comfortable, loose clothing that allows movement. Bring any scans (X-ray/MRI), doctor's notes and a list of medications if relevant.",
  },
  {
    question: "How many sessions will I need?",
    answer:
      "It depends on your condition. After the first assessment you'll get an honest estimate and a clear plan with milestones — no open-ended session counts.",
  },
  {
    question: "Do you offer home visits?",
    answer:
      "Yes, within city limits — ideal for elderly patients and post-surgical recovery. Home-visit slots are confirmed at the time of booking.",
  },
  {
    question: "What is the cancellation policy?",
    answer:
      "Please give at least 4 hours' notice to cancel or reschedule a clinic or home visit so the slot can go to another patient. See the refund policy page for online consultation refunds.",
  },
];

/** Prebuilt WhatsApp deep link with a friendly opening message */
export function whatsappLink(message?: string) {
  const text = encodeURIComponent(
    message ?? `Hi ${site.doctor.shortName}, I found your website and would like to ask about physiotherapy.`
  );
  return `https://wa.me/${site.whatsappNumber}?text=${text}`;
}

export function formatInr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}
