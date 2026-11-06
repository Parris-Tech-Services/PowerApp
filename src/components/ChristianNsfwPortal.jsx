import React, { useState } from "react";
import { COVENANT_CARDS, COVENANT_REFERENCES, COVENANT_TOPICS } from "../data/christianNsfw";

const dateString = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};
const makeId = () => crypto.randomUUID();
const SECTIONS = ["Explore", "Talk", "Our words", "Scene planner", "Aftercare", "Faith & privacy"];
const TOPIC_CATEGORIES = ["All", ...new Set(COVENANT_TOPICS.map((topic) => topic.category))];

const palette = {
  page: "#160d18", panel: "#2b1c2c", line: "#6e5064", text: "#fff5ef",
  secondary: "#f3c6d0", gold: "#e6c28a", muted: "#d5bdca", alert: "#f7c9a8",
};

export default function ChristianNsfwPortal({ space, onChange, onLock, onBack, onStudio }) {
  const [confirmed, setConfirmed] = useState(false);
  const [adult, setAdult] = useState(false);
  const [section, setSection] = useState("Explore");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [card, setCard] = useState(0);
  const [note, setNote] = useState({ title: "", body: "", status: "private" });
  const [plan, setPlan] = useState({ title: "", date: dateString(), ideas: "", limits: "", aftercare: "" });
  const [debrief, setDebrief] = useState({ date: dateString(), mood: "Connected", whatHelped: "", supportNeeded: "" });
  const [activeScene, setActiveScene] = useState(null);
  const [editingStop, setEditingStop] = useState(false);
  const [stopDraft, setStopDraft] = useState({ safeword: space.safeword, pauseSignal: space.pauseSignal });

  const panel = { background: palette.panel, border: "1px solid " + palette.line, padding: "18px 20px", borderRadius: 16, marginBottom: 16 };
  const input = { display: "block", width: "100%", boxSizing: "border-box", border: "1px solid " + palette.line,
    borderRadius: 10, padding: "12px 14px", margin: "7px 0 14px", minHeight: 45,
    color: palette.text, background: "#38263a", fontSize: 16, fontFamily: "inherit", lineHeight: 1.5 };
  const primary = { borderRadius: 10, padding: "12px 17px", color: "#211020", background: palette.gold, border: "none",
    fontSize: 15, fontWeight: 700, cursor: "pointer", minHeight: 44 };
  const secondary = { ...primary, background: "#453047", border: "1px solid #9a768d", color: palette.text };
  const small = { color: palette.muted, fontSize: 13, lineHeight: 1.65 };
  const title = { fontFamily: "Georgia, serif", fontWeight: 500, margin: "0 0 10px", fontSize: "clamp(24px, 5vw, 30px)" };
  const label = { display: "block", color: palette.secondary, fontSize: 13, fontWeight: 700, marginTop: 10 };
  const row = { display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", margin: "12px 0" };
  const change = (fn) => onChange((previous) => fn(previous));

  const add = (name, entry) => {
    change((current) => ({ ...current, [name]: [{ id: makeId(), ...entry }, ...current[name]] }));
  };
  const remove = (name, id) => {
    if (!confirm("Delete this private entry?")) return;
    change((current) => ({ ...current, [name]: current[name].filter((item) => item.id !== id) }));
  };

  if (!confirmed) {
    return (
      <div style={{ background: palette.page, color: palette.text, borderRadius: 20, padding: "clamp(18px, 5vw, 32px)", maxWidth: 760, margin: "16px auto" }}>
        <h2 style={title}>Christian NSFW mode · 18+</h2>
        <p style={{ lineHeight: 1.7 }}>This private portal discusses sex, masturbation, intercourse, oral and anal sex, toys, fantasies and consensual BDSM by name, alongside optional Christian marriage reflections.</p>
        <div style={panel}><p style={{ marginTop: 0 }}>It is intended for consenting adults only. Scripture does not replace consent, and marriage never creates an obligation to have sex. Nothing here is a claim that every practice is biblically endorsed.</p>
          <label style={{ ...label, marginBottom: 18 }}><input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} /> I am 18 or older and choose to enter.</label>
          <div style={row}>
            <button type="button" disabled={!adult} onClick={() => setConfirmed(true)} style={{ ...primary, opacity: adult ? 1 : 0.5 }}>Enter Christian NSFW mode</button>
            <button type="button" onClick={onBack} style={secondary}>Back to Settings</button>
          </div>
        </div>
      </div>
    );
  }

  const Scripture = () => space.showScripture && (
    <div style={{ ...panel, borderColor: "#a88c61", background: "#332637" }}>
      <span style={{ color: palette.gold, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase" }}>Faith reflection · optional</span>
      <p style={{ marginBottom: 6, lineHeight: 1.7 }}>Song of Songs 4–7 · Proverbs 5:18–19 · 1 Corinthians 7:3–5</p>
      <p style={{ ...small, margin: 0 }}>Affection, faithfulness and mutual care. Nothing in these passages removes either partner's right to decline or stop.</p>
    </div>
  );

  return (
    <div className="christian-nsfw" style={{ background: palette.page, color: palette.text, borderRadius: 20, padding: "clamp(14px, 3vw, 28px)", minHeight: 520 }}>
      <style>{".christian-nsfw h3{font-size:20px;margin:8px 0 14px}.christian-nsfw p{line-height:1.6}.christian-nsfw textarea{min-height:100px;resize:vertical}.christian-nsfw input:focus-visible,.christian-nsfw select:focus-visible,.christian-nsfw textarea:focus-visible,.christian-nsfw button:focus-visible{outline:3px solid #f3c6d0;outline-offset:2px}.christian-nsfw .mode-tabs{display:flex;gap:8px;overflow-x:auto;padding:3px 0 12px;margin:0 0 10px;scrollbar-width:thin}.christian-nsfw .mode-tabs button{flex-shrink:0;white-space:nowrap}.christian-nsfw .topic-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,265px),1fr));gap:12px}@media(max-width:500px){.christian-nsfw .topic-grid{grid-template-columns:1fr}}"}
      </style>
      <div style={{ ...panel, background: "linear-gradient(125deg,#43283d,#2a1a2f)", borderColor: "#987d7c" }}>
        <span style={{ color: palette.gold, letterSpacing: 2, fontSize: 11, textTransform: "uppercase" }}>Private marriage space · adults 18+</span>
        <h2 style={{ ...title, fontSize: "clamp(30px, 6vw, 44px)", marginTop: 10 }}>Christian NSFW mode</h2>
        <p style={{ margin: 0, maxWidth: 640 }}>Frank sexual conversations, private plans and reflections — with faith, mutual consent and dignity held together.</p>
      </div>
      <div style={row}>
        <button type="button" onClick={onLock} style={primary}>Lock now</button>
        <button type="button" onClick={onBack} style={secondary}>Back to Settings</button>
        <button type="button" onClick={onStudio} style={secondary}>Open regular Studio</button>
      </div>
      <p role="status" style={small}>This portal uses your existing encrypted Studio vault. No separate account, partner login or cross-device inbox is available. Escape locks the vault.</p>
      <nav className="mode-tabs" aria-label="Christian NSFW portal sections">
        {SECTIONS.map((tab) => <button key={tab} type="button" onClick={() => setSection(tab)}
          style={{ ...secondary, background: section === tab ? palette.gold : "#453047", color: section === tab ? "#211020" : palette.text }}
          aria-current={section === tab ? "page" : undefined}>{tab}</button>)}
      </nav>
      {section === "Explore" && (
        <>
          <h3 style={title}>Adult intimacy library</h3>
          <p style={small}>Direct language and practical considerations, not an instruction to perform an activity. Higher-risk topics have prominent warnings.</p>
          <Scripture />
          <div className="topic-grid" style={{ marginBottom: 14 }}>
            <div><label htmlFor="cnsfw-search" style={label}>Search adult topics</label><input id="cnsfw-search" style={input} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Oral sex, bondage, anal sex…" /></div>
            <div><label htmlFor="cnsfw-category" style={label}>Category</label><select id="cnsfw-category" style={input} value={category} onChange={(e) => setCategory(e.target.value)}>{TOPIC_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></div>
          </div>
          <div className="topic-grid">{COVENANT_TOPICS.filter((topic) => (category === "All" || topic.category === category) && (topic.title + topic.note).toLowerCase().includes(query.toLowerCase())).map((topic) =>
            <article key={topic.id} style={{ ...panel, margin: 0, borderColor: topic.risk !== "normal" ? "#df987c" : palette.line }}>
              <p style={{ ...small, color: palette.gold, margin: "0 0 8px" }}>{topic.category}</p>
              <h3 style={{ marginTop: 0 }}>{topic.title}</h3>
              {topic.risk !== "normal" && <p role="note" style={{ color: "#ffc6aa", fontWeight: 800 }}>⚠ {topic.risk === "critical" ? "CRITICAL RISK — DO NOT ATTEMPT" : "HIGH RISK"}</p>}
              <p style={{ ...small, fontSize: 14 }}>{topic.note}</p>
            </article>)}</div>
        </>
      )}
      {section === "Talk" && (
        <>
          <h3 style={title}>Sexual conversation cards</h3><Scripture />
          <div style={panel}>
            <p style={{ color: palette.gold, fontSize: 12 }}>{COVENANT_CARDS[card].category} · {card + 1} / {COVENANT_CARDS.length}</p>
            <p style={{ fontFamily: "Georgia,serif", fontSize: "clamp(20px,5vw,26px)" }}>{COVENANT_CARDS[card].prompt}</p>
            <div style={row}><button type="button" style={secondary} onClick={() => setCard((card - 1 + COVENANT_CARDS.length) % COVENANT_CARDS.length)}>Previous card</button>
            <button type="button" style={primary} onClick={() => setCard((card + 1) % COVENANT_CARDS.length)}>Next card</button></div>
          </div>
          <p style={small}>Either partner can skip any question. A shared fantasy or Yes is not permission to act.</p>
        </>
      )}
      {section === "Our words" && (
        <>
          <h3 style={title}>Private fantasy and intimacy notes</h3>
          <p style={small}>Write your own words, even explicit ones. Notes are encrypted in this shared vault; “For partner” is a label only, not an actual private message or separately secured inbox.</p>
          <form style={panel} onSubmit={(e) => { e.preventDefault(); if (!note.title.trim() && !note.body.trim()) return; add("privateNotes", { ...note, title: note.title.trim(), date: dateString() }); setNote({ title: "", body: "", status: "private" }); }}>
            <label htmlFor="cnsfw-note-title" style={label}>Private title</label>
            <input id="cnsfw-note-title" style={input} value={note.title} maxLength={140} onChange={(e) => setNote({ ...note, title: e.target.value })} />
            <label htmlFor="cnsfw-note-body" style={label}>Your words</label>
            <textarea id="cnsfw-note-body" style={input} value={note.body} maxLength={20000} onChange={(e) => setNote({ ...note, body: e.target.value })} placeholder="Personal ideas, fantasies, questions or thoughts…" />
            <label htmlFor="cnsfw-note-status" style={label}>Visibility label</label>
            <select id="cnsfw-note-status" style={input} value={note.status} onChange={(e) => setNote({ ...note, status: e.target.value })}>
              <option value="private">Private note</option><option value="for-partner">For partner to read</option>
            </select>
            <button type="submit" style={primary}>Save encrypted note</button>
          </form>
          {space.privateNotes.map((item) => <article key={item.id} style={panel}>
            <p style={{ ...small, color: palette.gold }}>{item.status === "for-partner" ? "For partner · shared vault" : "Private note · shared vault"} · {item.date}</p>
            <h3>{item.title || "Untitled"}</h3>
            <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{item.body}</p>
            <div style={row}>
              {item.status === "for-partner" && <button type="button" style={secondary} onClick={() => change((current) => ({ ...current, privateNotes: current.privateNotes.map((x) => x.id === item.id ? { ...x, status: "private" } : x) }))}>Mark discussed</button>}
              <button type="button" style={secondary} onClick={() => remove("privateNotes", item.id)}>Delete note</button>
            </div>
          </article>)}
        </>
      )}
      {section === "Scene planner" && (
        <>
          <h3 style={title}>Our private intimacy plan</h3>
          <p style={small}>Record mutual intentions and boundaries without scripting anyone's obligation. A plan cannot override a later no.</p>
          <Scripture />
          <div style={panel}>
            <h3>Stop and pause signals</h3>
            {editingStop ? <>
              <label htmlFor="cnsfw-stop" style={label}>Stop word</label><input id="cnsfw-stop" style={input} maxLength={50} value={stopDraft.safeword} onChange={(e) => setStopDraft({ ...stopDraft, safeword: e.target.value })} />
              <label htmlFor="cnsfw-pause" style={label}>Pause word</label><input id="cnsfw-pause" style={input} maxLength={50} value={stopDraft.pauseSignal} onChange={(e) => setStopDraft({ ...stopDraft, pauseSignal: e.target.value })} />
              <button type="button" style={primary} disabled={!stopDraft.safeword.trim() || !stopDraft.pauseSignal.trim()} onClick={() => { change((current) => ({ ...current, safeword: stopDraft.safeword.trim(), pauseSignal: stopDraft.pauseSignal.trim() })); setEditingStop(false); }}>Save encrypted signals</button>
            </> : <><p style={{ fontSize: 24, fontWeight: 800 }}>STOP: {space.safeword} · PAUSE: {space.pauseSignal}</p><button type="button" style={secondary} onClick={() => { setStopDraft({ safeword: space.safeword, pauseSignal: space.pauseSignal }); setEditingStop(true); }}>Edit stop signals</button></>}
          </div>
          <form style={panel} onSubmit={(e) => { e.preventDefault(); if (!plan.title.trim()) return; add("scenePlans", { ...plan, title: plan.title.trim(), safeword: space.safeword, pauseSignal: space.pauseSignal }); setPlan({ title: "", date: dateString(), ideas: "", limits: "", aftercare: "" }); }}>
            <label htmlFor="cnsfw-plan-title" style={label}>Plan title</label><input id="cnsfw-plan-title" style={input} maxLength={140} required value={plan.title} onChange={(e) => setPlan({ ...plan, title: e.target.value })} />
            <label htmlFor="cnsfw-plan-date" style={label}>Date</label><input id="cnsfw-plan-date" style={input} type="date" value={plan.date} onChange={(e) => setPlan({ ...plan, date: e.target.value })} />
            {[["ideas", "Ideas, acts, toys or roles to discuss"], ["limits", "Hard limits and things to avoid"], ["aftercare", "Aftercare and reconnection"]].map(([field, text]) => <div key={field}>
              <label htmlFor={"cnsfw-plan-" + field} style={label}>{text}</label>
              <textarea id={"cnsfw-plan-" + field} style={input} maxLength={field === "ideas" ? 6000 : 4000} value={plan[field]} onChange={(e) => setPlan({ ...plan, [field]: e.target.value })} />
            </div>)}
            <button type="submit" style={primary}>Save encrypted plan</button>
          </form>
          {space.scenePlans.map((item) => <article key={item.id} style={panel}>
            <h3>{item.title} · {item.date}</h3>
            {[["Ideas", item.ideas], ["Limits", item.limits], ["Aftercare", item.aftercare]].filter(([, val]) => val).map(([key, val]) => <p key={key} style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}><strong>{key}:</strong> {val}</p>)}
            <div style={row}><button type="button" style={primary} onClick={() => setActiveScene(item)}>Open stop-signal view</button><button type="button" style={secondary} onClick={() => remove("scenePlans", item.id)}>Delete plan</button></div>
          </article>)}
        </>
      )}
      {section === "Aftercare" && (
        <>
          <h3 style={title}>Aftercare and emotional check-in</h3><Scripture />
          <p style={small}>Reconnection, gentleness and any delayed discomfort matter. You can record this even if nothing sexual happened.</p>
          <form style={panel} onSubmit={(e) => { e.preventDefault(); add("debriefs", debrief); setDebrief({ date: dateString(), mood: "Connected", whatHelped: "", supportNeeded: "" }); }}>
            <label htmlFor="cnsfw-debrief-date" style={label}>Date</label><input id="cnsfw-debrief-date" type="date" style={input} value={debrief.date} onChange={(e) => setDebrief({ ...debrief, date: e.target.value })} />
            <label htmlFor="cnsfw-debrief-mood" style={label}>How are you feeling?</label><select id="cnsfw-debrief-mood" style={input} value={debrief.mood} onChange={(e) => setDebrief({ ...debrief, mood: e.target.value })}>
              {["Connected", "Relaxed", "Tired", "Overwhelmed", "Uncertain", "Disconnected", "Other"].map((value) => <option key={value}>{value}</option>)}
            </select>
            <label htmlFor="cnsfw-debrief-helped" style={label}>What felt good, caring or reassuring?</label><textarea id="cnsfw-debrief-helped" style={input} maxLength={4000} value={debrief.whatHelped} onChange={(e) => setDebrief({ ...debrief, whatHelped: e.target.value })} />
            <label htmlFor="cnsfw-debrief-support" style={label}>What would help next time?</label><textarea id="cnsfw-debrief-support" style={input} maxLength={4000} value={debrief.supportNeeded} onChange={(e) => setDebrief({ ...debrief, supportNeeded: e.target.value })} />
            <button type="submit" style={primary}>Save encrypted reflection</button>
          </form>
          {space.debriefs.map((item) => <article style={panel} key={item.id}><h3>{item.date} · {item.mood}</h3><p style={{ whiteSpace: "pre-wrap" }}>{item.whatHelped}</p><p style={{ whiteSpace: "pre-wrap" }}>{item.supportNeeded}</p><button type="button" onClick={() => remove("debriefs", item.id)} style={secondary}>Delete reflection</button></article>)}
        </>
      )}
      {section === "Faith & privacy" && (
        <>
          <h3 style={title}>Faith, consent and privacy</h3>
          <div style={panel}><label style={label}><input type="checkbox" checked={space.showScripture} onChange={(e) => change((current) => ({ ...current, showScripture: e.target.checked }))} /> Show scripture reflection cards in Christian NSFW mode</label>
            <p style={small}>This setting is stored inside your encrypted vault. It doesn't change the regular Studio or legacy Covenant page.</p></div>
          {COVENANT_REFERENCES.filter(() => space.showScripture).map((item) => <article style={panel} key={item.reference}><p style={{ color: palette.gold, margin: "0 0 5px" }}>{item.reference}</p><h3>{item.theme}</h3><p style={small}>{item.reflection}</p></article>)}
          <div style={panel}>
            <h3>Security reality</h3>
            <p style={small}>PowerApp is a static public website, but your new private entries are encrypted locally on this browser. No usernames, biometric unlock, separate partner accounts or sync exist. Anyone with the passphrase and device can read everything in this shared vault; privacy labels do not create separate permissions.</p>
            <p style={small}>Older worksheets outside the Studio are unencrypted. Use Settings → Privacy & Data to clear them. Back up the encrypted vault before wiping your browser; losing the passphrase means losing the content.</p>
            <button type="button" style={primary} onClick={onLock}>Lock this private mode</button>
          </div>
        </>
      )}
      {activeScene && <div role="dialog" aria-modal="true" aria-label="Stop-signal view" style={{ position: "fixed", inset: 0, zIndex: 9999, padding: 20, overflowY: "auto", background: "#13090f", color: palette.text, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 650, textAlign: "center" }}>
          <p style={{ letterSpacing: 3, fontSize: 13, color: palette.gold }}>PRIVATE STOP SIGNALS</p>
          <h2 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(28px,5vw,44px)" }}>{activeScene.title}</h2>
          <div style={{ border: "3px solid #e99a94", borderRadius: 20, padding: 24, margin: "24px 0" }}>
            <p style={{ fontSize: 15, margin: "0 0 6px" }}>STOP IMMEDIATELY</p>
            <p style={{ fontSize: "clamp(40px,11vw,76px)", fontWeight: 900, margin: 0, overflowWrap: "anywhere" }}>{activeScene.safeword || space.safeword}</p>
            <p style={{ fontSize: 22 }}>PAUSE: {activeScene.pauseSignal || space.pauseSignal}</p>
          </div>
          <p>Either person can stop at any moment. A plan is never ongoing consent. Take care of each other afterwards.</p>
          <div style={{ ...row, justifyContent: "center" }}><button type="button" style={primary} onClick={() => setActiveScene(null)}>Close stop-signal view</button><button type="button" style={secondary} onClick={() => { setActiveScene(null); onLock(); }}>PANIC — lock vault</button></div>
        </div>
      </div>}
    </div>
  );
}
