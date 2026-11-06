import { initialChristianSpace, normaliseChristianSpace } from "./christianNsfw.js";

export const ACTIVITY_LIBRARY = [
  { id: "kissing", category: "Affection", title: "Kissing", note: "Talk about the kind of kissing, timing and affection each of you enjoys." },
  { id: "cuddling", category: "Affection", title: "Cuddling and closeness", note: "Intimacy can be meaningful without leading to sex." },
  { id: "massage", category: "Sensual touch", title: "Sensual massage", note: "Check pressure, comfort and whether touch is welcome." },
  { id: "skin_touch", category: "Sensual touch", title: "Skin-to-skin touch", note: "Ask before escalating touch; either partner can change their mind." },
  { id: "masturbation_solo", category: "Masturbation", title: "Solo masturbation and privacy", note: "Discuss privacy, comfort, boundaries and any feelings about solo pleasure." },
  { id: "masturbation_together", category: "Masturbation", title: "Mutual masturbation", note: "Discuss mutual comfort and consent without assuming shared interest." },
  { id: "oral", category: "Oral sex", title: "Oral sex", note: "Discuss preferences and barriers; oral sex can transmit STIs." },
  { id: "intercourse", category: "Intercourse", title: "Vaginal intercourse", note: "Talk about lubrication, contraception, STI prevention, pain and comfort." },
  { id: "positions", category: "Intercourse", title: "Positions and comfort", note: "Explore comfortable alternatives without pushing through pain or strain." },
  { id: "lubrication", category: "Sexual wellbeing", title: "Lubricants and comfort", note: "Check compatibility with condoms or toys, ingredients and sensitivities." },
  { id: "contraception", category: "Sexual wellbeing", title: "Contraception and pregnancy intentions", note: "Agree on reliable information and discuss choices with a clinician when needed." },
  { id: "toys", category: "Sex toys", title: "Sex toys", note: "Consider body-safe materials, hygiene, sharing precautions and comfort." },
  { id: "fantasy", category: "Fantasy", title: "Sharing fantasies", note: "A fantasy can be shared without any expectation of acting on it." },
  { id: "roleplay", category: "Roleplay", title: "Consensual roleplay", note: "Agree on scenarios, limits, a way to stop, and a return to normal roles." },
  { id: "dominance", category: "BDSM and power", title: "Dominance and submission", note: "Power exchange requires freely given, specific and revocable consent." },
  { id: "sensation", category: "BDSM and power", title: "Mild sensation play", note: "Be attentive to discomfort, injury risks and non-verbal communication." },
  { id: "restraints", category: "BDSM and power", title: "Restraint conversations", note: "Do not restrain anyone without a clear agreement and immediate ability to stop; avoid high-risk practices." },
  { id: "aftercare", category: "Care", title: "Aftercare and reassurance", note: "Talk about warmth, space, food, water and emotional check-ins afterwards." },
  { id: "no_sex", category: "Care", title: "Affection without sex", note: "Include cuddling, conversation or simply time together as complete choices." },
];

export const CONVERSATION_CARDS = [
  { category: "Desire", question: "What kind of sexual attention makes you feel most wanted?" },
  { category: "Desire", question: "Which sexual experiences have felt especially connecting to you?" },
  { category: "Preferences", question: "What would you like more of in our sex life, and what less?" },
  { category: "Preferences", question: "How do you feel about oral sex, masturbation, intercourse or toys?" },
  { category: "Fantasy", question: "Is there a fantasy you would enjoy talking about even if we never act on it?" },
  { category: "Pleasure", question: "What helps you relax and feel comfortable receiving pleasure?" },
  { category: "Boundaries", question: "What is firmly off-limits, even if it once sounded interesting?" },
  { category: "Boundaries", question: "How can I make it easy for you to say no or stop without disappointment?" },
  { category: "Communication", question: "How should we signal when we want something different or need to pause?" },
  { category: "Connection", question: "How can we enjoy affection on nights when neither of us wants sex?" },
  { category: "Aftercare", question: "What care, affection or space helps you feel good afterwards?" },
  { category: "Faith", question: "Are there values or beliefs we want to discuss as part of our sexual relationship?" },
];

export const VOTE_OPTIONS = [
  { value: "", label: "Unanswered" },
  { value: "yes", label: "Yes" },
  { value: "maybe", label: "Maybe" },
  { value: "no", label: "No" },
  { value: "hard_limit", label: "Hard limit" },
];

export function initialAdultData() {
  return {
    version: 1,
    votes: { A: {}, B: {} },
    ready: { A: false, B: false },
    customActivities: [],
    journal: [],
    plans: [],
    checkins: [],
    christian: initialChristianSpace(),
  };
}

export function mutualYes(votes, ready, activities) {
  if (!ready?.A || !ready?.B) return [];
  return activities.filter((a) => votes?.A?.[a.id] === "yes" && votes?.B?.[a.id] === "yes");
}

export function safeAdultData(raw) {
  const blank = initialAdultData();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return blank;
  const list = (items, max) => Array.isArray(items) ? items.filter((v) => v && typeof v === "object" && !Array.isArray(v)).slice(0, max) : [];
  const vote = (v) => ["yes", "maybe", "no", "hard_limit"].includes(v) ? v : "";
  const cleanVotes = (v) => {
    if (!v || typeof v !== "object" || Array.isArray(v)) return {};
    return Object.fromEntries(Object.entries(v).filter(([key]) => /^[a-z0-9_-]{1,80}$/i.test(key)).slice(0, 250).map(([key, value]) => [key, vote(value)]).filter(([, value]) => value));
  };
  return {
    version: 1,
    votes: { A: cleanVotes(raw.votes?.A), B: cleanVotes(raw.votes?.B) },
    ready: { A: raw.ready?.A === true, B: raw.ready?.B === true },
    customActivities: list(raw.customActivities, 150),
    journal: list(raw.journal, 200),
    plans: list(raw.plans, 200),
    checkins: list(raw.checkins, 365),
    christian: normaliseChristianSpace(raw.christian),
  };
}