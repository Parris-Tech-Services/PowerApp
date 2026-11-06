# PowerApp

PowerApp is a private, safety-first React/Vite app for an adult married couple learning about beginner-level BDSM/kink through consent, communication, preparation, aftercare, reflection, and real-world support.


## Christian NSFW Mode — Settings portal

**Settings → Christian NSFW mode (18+)** opens a separate, private, adult-only screen. It shares the **existing PowerApp AES-256-GCM vault and passphrase**, with an age confirmation each time the portal is opened. The route is never persisted as a plaintext last-visited setting. Switching tabs, reloading, Escape, the lock button or hiding the browser locks access; returning requires unlocking again.

The portal contains **86 directly named adult topics**, including oral sex, anal sex, pegging, masturbation, toys, consensual BDSM, sexual health, fantasy and digital privacy. It includes factual safety notes, clear avoidances for breath restriction and other dangerous practices, a conversation card deck, user-authored private notes, custom intimate plans and stop signals, optional per-partner orgasm/pleasure/discomfort reflections and aftercare, and optional Scripture reflections (Song of Songs, Proverbs 5, 1 Corinthians 7, Ephesians 5, Galatians 5). No graphic erotic text is generated; couples author their own content in encrypted fields.

**Faith and consent:** No Bible verse creates a sexual obligation. Consent is specific, present, mutual and revocable. Christian interpretations vary; Bible references are offered as reflection rather than endorsement of any particular sexual practice.

**Privacy scope:** This is a shared local vault, **not two partner accounts**. A “for partner” label is only a same-device shared-vault label, not secure messaging or cross-device delivery. Existing Studio data is not deleted or rewritten by opening the portal; the optional \`christian\` subdocument is added when a user saves new content. Legacy screens outside the encrypted Studio still store plaintext browser data.

## Adult Private Studio (November 2026)

PowerApp now includes a dedicated **Private Studio** for adults (18+): a frank factual sexual-wellbeing library (including masturbation, oral sex, intercourse, toys, consensual roleplay and BDSM), a custom interest builder, mutual Yes/No/Maybe conversations, encrypted user-authored fantasy journal, evening planner, conversation prompts and intimacy check-ins. The optional Covenant section remains separate.

### Local encrypted vault

- New Studio notes, votes, plans and check-ins are encrypted in-browser with **AES-256-GCM** (random nonce per save), with **PBKDF2-SHA256 at 310,000 iterations** and a random salt deriving a non-extractable encryption key from your passphrase.
- The passphrase is never uploaded; there is **no account, third-party analytics, backend sync or recovery service**. The site is a static publicly served program; its contents do not include any of your vault data. Every browser/device has its own encrypted storage.
- You can export/import a JSON **encrypted backup**; store it privately and keep the passphrase. Losing the passphrase means losing access to the data.
- The vault is **shared between people who know the passphrase**. Sealed Yes/No/Maybe ballots are hidden by the normal interface; they are not protected by separate partner credentials. Reopening a sealed ballot requires discarding its previous answers. No or Hard Limit never appears among mutual Yes matches.
- **Existing** Connect, Prepare, Reflect and other legacy features still use **unencrypted browser localStorage**. The encrypted vault **does not automatically migrate them**, to avoid data loss. Clear their sensitive entries using the legacy Privacy controls if no longer needed.
- Local encryption does not defend against malware, compromised devices, malicious browser extensions, screen captures, or someone viewing the vault while it is unlocked. Deleting browser data also deletes the vault. Panic Clear removes **both** legacy data and the vault.
- The Studio is not a pornographic-content generator. It provides factual education and private fields for adults to write their own notes and fantasies.

### Test and build

```sh
npm ci
npm test
npm run build
```

PR checks run tests and the Vite production build. When making a change that affects the saved vault format, test migration and encrypted backup restoration before merging.

## What It Is

- A guided learning and conversation tool.
- A local-only worksheet and planning app.
- A calm safety dashboard for safewords, check-ins, and aftercare.
- A reference for beginner concepts, glossary terms, red flags, and Australian support resources.

## What It Is Not

- Not explicit content.
- Not a list of things to try.
- Not medical, legal, psychological, crisis, or pastoral counselling advice.
- Not a substitute for real-world help if anyone feels unsafe, coerced, pressured, afraid, or unable to say no.

## Ethical Boundaries

- Marriage never replaces consent.
- Maybe is not permission.
- The slower partner sets the pace.
- Red means stop immediately, drop the role, offer warmth, no argument, no sulking, no persuasion.
- Yellow means pause, check in, reduce intensity, change course, or stop.
- Stopping after an honest conversation is a complete and successful evening.
- High-risk practices are listed only as beginner avoidances, not instructions.

## Privacy Model

- New Private Studio data is stored as AES-GCM ciphertext in browser `localStorage`; **older screens still store unencrypted data**.
- No backend, analytics, tracking, or external API calls are used. The formerly embedded third-party network script was removed.
- Anyone with device/browser access may see saved notes, worksheets, plans, or debriefs.
- Use Panic Clear before lending or sharing a device.
- Private/incognito browsing may delete saved data automatically.

## Setup

```bash
npm install
npm run dev
```

## Build And Test

```bash
npm test
npm run build
```

## Deployment

The app is configured for both Vercel and GitHub Pages.

- GitHub Pages (current production): `https://parris-tech-services.github.io/PowerApp/`
- Vercel (may be behind Pages due deployment quota): `https://power-app-delta-three.vercel.app/`
- Static beginner guide: `/beginners-guide.html`

## Australian Support Resources

- Emergency: `000`
- 1800RESPECT: `1800 737 732`
- Lifeline: `13 11 14`
- MensLine Australia: `1300 78 99 78`
- Blue Knot Foundation: `1300 657 380`
- Full Stop Australia: `1800 385 578`
- Consent.gov.au: `https://www.consent.gov.au`
- eSafety Commissioner: `https://www.esafety.gov.au`

If anyone feels unsafe, coerced, pressured, afraid, or unable to say no, stop using the app for exploration and seek real-world support.
