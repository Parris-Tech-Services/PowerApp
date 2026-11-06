/**
 * Candid, non-graphic adult sexual wellbeing information with optional Christian reflection.
 * A topic is never consent. No sexual notes or partner answers are shipped with the app.
 */
export const COVENANT_TOPICS = [
  ["Kissing and affection", "Connection", "Agree on affection that feels welcome, including when neither partner wants sex."],
  ["Sexual initiation", "Communication", "Ask clearly and accept no without argument or sulking."],
  ["Sex drive differences", "Communication", "A difference in desire is not a debt, defect or obligation."],
  ["Solo masturbation", "Masturbation", "Talk openly about privacy, conscience and expectations."],
  ["Mutual masturbation", "Masturbation", "Discuss interest and comfort without assuming that both partners want it."],
  ["Oral sex", "Sexual activity", "Discuss consent, STI transmission and whether barriers matter for you."],
  ["Vaginal intercourse", "Sexual activity", "Talk about comfort, contraception, lubrication, pleasure and any pain."],
  ["Anal sex", "Sexual activity", "Higher risk of tearing and STI transmission; use evidence-based health information and stop if painful."],
  ["Sexual positions", "Sexual activity", "Consider comfort, disability, mobility, fatigue and pain without pressure to perform."],
  ["Manual sexual stimulation", "Sexual activity", "Discuss touch preferences and hygiene; a previous yes does not cover later touch."],
  ["Orgasm and pleasure", "Pleasure", "Pleasure is worth discussing, but orgasm is never a requirement or scorecard."],
  ["Orgasm timing and control", "Pleasure", "Discuss personal preferences while respecting the right to stop at any point."],
  ["Edging", "Pleasure", "Some couples are curious about delaying orgasm; avoid turning an expectation into pressure."],
  ["Sex toys", "Toys", "Consider material safety, cleaning, sharing precautions and any sensitivities."],
  ["Vibrators", "Toys", "Talk about comfort, noise, privacy, hygiene and shared preferences."],
  ["Lubricants", "Sexual health", "Check product ingredients and compatibility with condoms or toys."],
  ["Contraception", "Sexual health", "Discuss pregnancy intentions and suitable methods with a qualified clinician."],
  ["STI conversations", "Sexual health", "Testing and prevention are mutual health conversations, not moral judgements."],
  ["Pain during sex", "Sexual health", "Stop when something hurts. Persistent pain deserves appropriate medical care."],
  ["Postpartum intimacy", "Sexual health", "Recovery, fatigue, changed desire and comfortable pacing deserve respect."],
  ["Body image and vulnerability", "Connection", "Share what helps you feel accepted without comparison or criticism."],
  ["Fantasy discussions", "Fantasy", "You may discuss a fantasy without any expectation of enacting it."],
  ["Sexual roleplay", "Fantasy", "Agree on the theme and boundaries; roleplay never cancels ordinary consent."],
  ["Dirty-talk preferences", "Fantasy", "Discuss which kinds of language feel welcome, unkind or uncomfortable."],
  ["Dominance and submission", "BDSM", "Agree on what control means and where it ends. Submission is voluntary and revocable."],
  ["Light impact play", "BDSM", "Impact can injure people. Discuss health concerns and stop at any sign of harm."],
  ["Bondage and restraints", "BDSM", "Restraints carry injury and circulation risks. Avoid improvisation and maintain immediate ability to stop."],
  ["Blindfolds and sensory play", "BDSM", "Agree on limits and check that the person can stop or remove it immediately."],
  ["Power exchange aftercare", "BDSM", "After any intense exchange, check emotional wellbeing and reconnect as equals."],
  ["Role boundaries", "BDSM", "A negotiated role has no authority outside the agreed context."],
  ["Breath restriction and choking", "High-risk safety", "Do not practise choking, strangulation or breath restriction. Even brief pressure can cause serious injury or death.", "critical"],
  ["Needles, cutting and blood play", "High-risk safety", "These carry infection, injury and bleeding risks and are not suitable as beginner activities. No how-to guidance is provided.", "critical"],
  ["Heavy impact and suspension", "High-risk safety", "These can cause serious injury. Do not improvise dangerous techniques.", "high"],
  ["Coercion and intoxication", "High-risk safety", "Sex under pressure or without capacity for freely given consent is not acceptable. Stop rather than negotiate around a no.", "critical"],
  ["Aftercare and reassurance", "Care", "Discuss comfort, space, check-ins, food, water and emotional support."],
  ["Sex-free intimacy", "Care", "Cuddling, conversation, prayer or rest can be complete experiences on their own."],
].map(([title, category, note, risk], index) => ({ id: "cnsfw-" + index, title, category, note, risk: risk || "normal" }));

export const COVENANT_CARDS = [
  { category: "Desire", prompt: "What makes our sexual relationship feel emotionally safe and genuinely wanted?" },
  { category: "Pleasure", prompt: "What do we each enjoy about oral sex, intercourse or mutual masturbation?" },
  { category: "Pleasure", prompt: "How would we like to discuss orgasms without making them a performance target?" },
  { category: "Fantasy", prompt: "What fantasy could we talk about without agreeing to act on it?" },
  { category: "Fantasy", prompt: "What language or roleplay ideas feel welcome, and what words are off-limits?" },
  { category: "Boundaries", prompt: "What is a hard no for each of us, and how do we honour it without debate?" },
  { category: "Boundaries", prompt: "What does a comfortable pause or stop look and sound like?" },
  { category: "Care", prompt: "What would thoughtful aftercare look like for each of us?" },
  { category: "Faith", prompt: "How might Song of Songs shape our view of affection and mutual delight?" },
  { category: "Faith", prompt: "How do we read 1 Corinthians 7 without treating intimacy as an entitlement?" },
  { category: "Faith", prompt: "How can patience, gentleness and self-control shape our approach to sex?" },
  { category: "Connection", prompt: "How can we stay close when one of us doesn't want sex?" },
  { category: "Health", prompt: "Are there physical comforts, health needs or risks we need to discuss?" },
  { category: "Communication", prompt: "What might we change to make initiation less pressured for both of us?" },
];

export const COVENANT_REFERENCES = [
  { reference: "Song of Songs 4–7", theme: "Affection and mutual desire", reflection: "An ancient poem celebrating love and delight; reflect together without using poetry as a prescription." },
  { reference: "Proverbs 5:18–19", theme: "Joy and faithfulness", reflection: "Consider loyalty, gratitude and mutual delight in a committed relationship." },
  { reference: "1 Corinthians 7:3–5", theme: "Mutuality and communication", reflection: "Read in context; this passage must never be used to override someone's freely given consent." },
  { reference: "Ephesians 5:25", theme: "Self-giving love", reflection: "Consider how love refuses coercion and makes room for vulnerability." },
  { reference: "Galatians 5:22–23", theme: "The fruit of the Spirit", reflection: "Patience, gentleness, kindness and self-control also matter in intimate moments." },
  { reference: "Hebrews 13:4", theme: "Honour and fidelity", reflection: "Think about privacy, respect, boundaries and shared values." },
];

/** Separate optional adult mode data, inside the existing encrypted vault. */
export const initialChristianSpace = () => ({
  showScripture: true,
  safeword: "Red",
  pauseSignal: "Yellow",
  privateNotes: [],
  scenePlans: [],
  debriefs: [],
});

const objects = (value, limit) => Array.isArray(value)
  ? value.filter((entry) => entry && typeof entry === "object" && !Array.isArray(entry)).slice(0, limit)
  : [];
const clipped = (value, max, fallback = "") => typeof value === "string" ? value.slice(0, max) : fallback;
const safeEntry = (entry, fields) => Object.fromEntries(
  fields.map(([key, len]) => [key, clipped(entry[key], len)]),
);

export function normaliseChristianSpace(value) {
  const empty = initialChristianSpace();
  if (!value || typeof value !== "object" || Array.isArray(value)) return empty;
  const keep = (items, fields, limit) => objects(items, limit).map((entry) => ({
    id: clipped(entry.id, 80),
    ...safeEntry(entry, fields),
  }));
  return {
    showScripture: value.showScripture !== false,
    safeword: clipped(value.safeword, 50, "Red") || "Red",
    pauseSignal: clipped(value.pauseSignal, 50, "Yellow") || "Yellow",
    privateNotes: keep(value.privateNotes, [["title", 140], ["body", 20000], ["date", 30], ["status", 20]], 150),
    scenePlans: keep(value.scenePlans, [["title", 140], ["date", 30], ["ideas", 6000], ["limits", 4000], ["aftercare", 4000], ["safeword", 50], ["pauseSignal", 50]], 150),
    debriefs: keep(value.debriefs, [["date", 30], ["mood", 100], ["whatHelped", 4000], ["supportNeeded", 4000]], 250),
  };
}
