import React, { useEffect, useRef, useState } from "react";
import ChristianNsfwPortal from "./ChristianNsfwPortal";
import { ACTIVITY_LIBRARY, CONVERSATION_CARDS, VOTE_OPTIONS, initialAdultData, mutualYes, safeAdultData } from "../data/adult";
import { createEncryptedVault, encryptVaultData, parseVaultRecord, readVaultRecord, removeVaultRecord, saveVaultRecord, unlockEncryptedVault } from "../utils/adultVault";

const id = () => crypto.randomUUID();
const today = () => { const date = new Date(); date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); return date.toISOString().slice(0, 10); };
const SECTIONS = ["Library", "Our choices", "Journal", "Planner", "Conversation", "Check-ins", "Privacy"];
const CATEGORIES = ["All", ...new Set(ACTIVITY_LIBRARY.map((a) => a.category))];

export default function IntimacyStudio({ C, s, onNavigate, portalOnly = false }) {
  const [record, setRecord] = useState(() => { try { return readVaultRecord(); } catch { return "corrupt"; } });
  const recordRef = useRef(record);
  const keyRef = useRef(null);
  const dataRef = useRef(null);
  const saveQueue = useRef(Promise.resolve());
  const deletingRef = useRef(false);
  const [data, setData] = useState(null);
  const [secret, setSecret] = useState("");
  const [verify, setVerify] = useState("");
  const [adult, setAdult] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState("Library");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [ballot, setBallot] = useState(null);
  const [showMatches, setShowMatches] = useState(false);
  const [draft, setDraft] = useState({ title: "", body: "", tag: "Private reflection", shared: false });
  const [editingId, setEditingId] = useState(null);
  const [activity, setActivity] = useState({ title: "", category: "Our ideas", note: "" });
  const [plan, setPlan] = useState({ date: today(), title: "", mood: "", agreed: "", boundaries: "", aftercare: "" });
  const [checkin, setCheckin] = useState({ date: today(), connection: "3", desire: "3", satisfaction: "3", mood: "Neutral", notes: "" });
  const [cardIndex, setCardIndex] = useState(0);
  const fileRef = useRef(null);

  const box = { ...s.card, borderRadius: 16 };
  const intro = { ...s.p, maxWidth: 720 };
  const buttonRow = { display: "flex", flexWrap: "wrap", gap: 8, margin: "12px 0 20px" };
  const secondary = { ...s.btn("outline"), padding: "10px 14px" };
  const primary = { ...s.btn(), padding: "10px 18px" };

  const save = (next) => {
    if (deletingRef.current || !keyRef.current || !recordRef.current) return;
    const cleaned = safeAdultData(next);
    dataRef.current = cleaned;
    setData(cleaned);
    setSaving(true);
    saveQueue.current = saveQueue.current.catch(() => {}).then(async () => {
      const latest = await encryptVaultData(keyRef.current, recordRef.current, cleaned);
      saveVaultRecord(latest);
      recordRef.current = latest;
      setRecord(latest);
    }).then(() => setSaving(false)).catch(() => {
      setSaving(false);
      setError("Changes could not be saved. Check available browser storage and export a backup before closing.");
    });
  };
  const modify = (fn) => save(fn(dataRef.current));

  const lock = async () => {
    await saveQueue.current.catch(() => {});
    keyRef.current = null;
    dataRef.current = null;
    setData(null);
    setBallot(null);
    setShowMatches(false);
    setSecret("");
    setVerify("");
  };
  useEffect(() => {
    const onHidden = () => { if (document.visibilityState === "hidden") { void lock(); } };
    document.addEventListener("visibilitychange", onHidden);
    return () => document.removeEventListener("visibilitychange", onHidden);
  }, []);

  const start = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (!record && !adult) throw new Error("Confirm that you are an adult aged 18 or over.");
      if (!record && secret !== verify) throw new Error("Passphrases do not match.");
      const result = record ? await unlockEncryptedVault(secret, record) : await createEncryptedVault(secret, initialAdultData());
      if (!record) { saveVaultRecord(result.record); recordRef.current = result.record; setRecord(result.record); }
      keyRef.current = result.key;
      dataRef.current = safeAdultData(result.data || initialAdultData());
      setData(dataRef.current);
      setSecret("");
      setVerify("");
    } catch (err) { setError(err.message || "Unable to open the vault."); }
    finally { setBusy(false); }
  };

  const exportBackup = async () => {
    await saveQueue.current.catch(() => {});
    const file = new Blob([JSON.stringify(recordRef.current, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = "powerapp-encrypted-vault-" + today() + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  const importBackup = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 5_000_000) throw new Error("Backup is too large.");
      const incoming = parseVaultRecord(await file.text());
      if (!confirm("Replace this device's encrypted vault with this backup? Any current vault data will be lost.")) return;
      saveVaultRecord(incoming);
      recordRef.current = incoming;
      setRecord(incoming);
      setError("");
      setSecret("");
    } catch (err) { setError(err.message); }
    finally { event.target.value = ""; }
  };
  const deleteVault = async () => {
    if (!confirm("Permanently delete the encrypted adult vault on this device? This cannot be undone without an exported backup.")) return;
    deletingRef.current = true;
    await saveQueue.current.catch(() => {});
    removeVaultRecord();
    recordRef.current = null;
    keyRef.current = null;
    dataRef.current = null;
    setRecord(null);
    setData(null);
    setSecret("");
    setAdult(false);
    setError("");
    deletingRef.current = false;
  };
  useEffect(() => {
    if (!portalOnly || !data) return undefined;
    const escapeLock = (event) => {
      if (event.key === "Escape") { event.preventDefault(); void lock(); }
    };
    window.addEventListener("keydown", escapeLock);
    return () => window.removeEventListener("keydown", escapeLock);
  }, [portalOnly, data]);

  const activities = data ? [...ACTIVITY_LIBRARY, ...data.customActivities] : [];
  const openBallot = (partner) => {
    if (data.ready[partner]) {
      if (!confirm("This partner has sealed their answers. To answer again, their existing choices must be erased and re-entered. Continue?")) return;
      modify((prev) => ({ ...prev, votes: { ...prev.votes, [partner]: {} }, ready: { ...prev.ready, [partner]: false } }));
    }
    setBallot(partner);
    setShowMatches(false);
  };

  return (
    <div style={s.page} className="intimacy-studio">
      <style>{".intimacy-studio .studio-tabs{display:flex;gap:8px;overflow-x:auto;padding:6px 0 12px;scrollbar-width:thin}.intimacy-studio .studio-tabs button{white-space:nowrap;flex-shrink:0}.intimacy-studio .studio-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,270px),1fr));gap:14px}.intimacy-studio .studio-card{margin:0}.intimacy-studio .studio-fields{display:grid;gap:8px}.intimacy-studio textarea{min-height:90px}.intimacy-studio label{display:block;font-weight:600;margin:8px 0 4px}.intimacy-studio .muted{font-size:13px;line-height:1.6;opacity:.85}.intimacy-studio button:disabled{opacity:.5;cursor:not-allowed}@media(max-width:480px){.intimacy-studio .studio-grid{grid-template-columns:1fr}}"}
      </style>
      <div style={{ margin: "0 0 22px", padding: "22px 20px", borderRadius: 18, background: "linear-gradient(125deg,#4b2032,#301b29)", color: "#fff7f1" }}>
        <p style={{ margin: 0, letterSpacing: 3, textTransform: "uppercase", fontSize: 11, color: "#e9c9bb" }}>For consenting adults · 18+</p>
        <h1 style={{ fontSize: "clamp(30px,6vw,42px)", fontFamily: "Georgia,serif", margin: "8px 0 10px" }}>{portalOnly ? "Christian NSFW portal" : "Our private intimacy studio"}</h1>
        <p style={{ lineHeight: 1.65, margin: 0, maxWidth: 660 }}>{portalOnly ? "A separate adults-only Christian marriage space, protected by the same encrypted local vault." : "An open, sex-positive space to learn, share preferences, talk about fantasies, and care for your relationship — without any pressure to do more."}</p>
      </div>
      {error && <div role="alert" style={s.warnBox}>{error}</div>}
      {!data ? (
        <div style={{ ...box, maxWidth: 560 }}>
          <h2 style={s.h2}>{record === "corrupt" ? "Vault record needs recovery" : record ? "Unlock your private vault" : "Create a private vault"}</h2>
          {record === "corrupt" ? <p style={intro}>The existing encrypted record is invalid. Do not delete it unless you have a backup; seek a trusted technical recovery.</p> : (
            <>
              <p style={intro}>Your intimate entries will be encrypted on this device using AES-256-GCM and a key derived from your passphrase. Nothing is synchronised to another device. This is a shared vault, not separate partner accounts.</p>
              <form onSubmit={start}>
                <label htmlFor="studio-password">Vault passphrase</label>
                <input id="studio-password" type="password" autoComplete={record ? "current-password" : "new-password"} minLength={record ? 1 : 12} required value={secret} onChange={(e) => setSecret(e.target.value)} style={s.input} />
                {!record && (
                  <>
                    <label htmlFor="studio-verify">Confirm passphrase</label>
                    <input id="studio-verify" type="password" autoComplete="new-password" required value={verify} onChange={(e) => setVerify(e.target.value)} style={s.input} />
                    <label style={{ marginBottom: 18 }}><input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} /> I confirm I am at least 18.</label>
                  </>
                )}
                <button disabled={busy} type="submit" style={primary}>{busy ? "Securing…" : record ? "Unlock" : "Create encrypted vault"}</button>
              </form>
            </>
          )}
          {record && <div style={buttonRow}><button type="button" onClick={() => fileRef.current?.click()} style={secondary}>Import encrypted backup</button><button type="button" onClick={deleteVault} style={secondary}>Delete vault on this device</button></div>}
          <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={importBackup} />
          <p className="muted">Important: There is no password recovery. Keep an encrypted backup somewhere safe. Older PowerApp worksheets remain unencrypted in legacy browser storage until cleared from Privacy.</p>
        </div>
      ) : portalOnly ? (
        <ChristianNsfwPortal
          space={data.christian}
          onChange={(fn) => modify((prev) => ({ ...prev, christian: fn(prev.christian) }))}
          onLock={lock}
          onBack={() => { void lock().then(() => onNavigate("more")); }}
          onStudio={() => { void lock().then(() => onNavigate("studio")); }}
        />
      ) : (
        <>
          <div style={{ display: "flex", gap: 10, justifyContent: "space-between", flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
            <span role="status" className="muted">{saving ? "Encrypting changes…" : "Encrypted locally · unlocked for this session"}</span>
            <button type="button" onClick={lock} style={secondary}>Lock vault</button>
          </div>
          <nav className="studio-tabs" aria-label="Private studio sections">
            {SECTIONS.map((tab) => <button type="button" key={tab} onClick={() => setSection(tab)} aria-current={section === tab ? "page" : undefined} style={{ ...secondary, background: section === tab ? "#4b2032" : "transparent", color: section === tab ? "#fff" : C.ink }}>{tab}</button>)}
          </nav>
          {section === "Library" && (
            <>
              <h2 style={s.h2}>Adult intimacy library</h2>
              <p style={intro}>An inclusive, factual starting point. Learning about an activity never implies agreement to try it.</p>
              <div className="studio-grid" style={{ marginBottom: 18 }}>
                <div><label htmlFor="studio-search">Search topics</label><input id="studio-search" style={s.input} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Oral sex, toys, fantasies…" /></div>
                <div><label htmlFor="studio-category">Category</label><select id="studio-category" style={s.input} value={category} onChange={(e) => setCategory(e.target.value)}>{[...new Set([...CATEGORIES, ...data.customActivities.map((a) => a.category)])].map((item) => <option key={item}>{item}</option>)}</select></div>
              </div>
              <div className="studio-grid">
                {activities.filter((a) => (category === "All" || a.category === category) && (a.title + " " + a.note).toLowerCase().includes(search.toLowerCase())).map((a) => (
                  <article className="studio-card" style={box} key={a.id}>
                    <p style={s.label}>{a.category}</p><h3 style={{ margin: "0 0 8px" }}>{a.title}</h3><p style={{ ...s.p, fontSize: 14 }}>{a.note}</p>
                    <button type="button" onClick={() => { setSection("Our choices"); setBallot(null); }} style={secondary}>Discuss our interest</button>
                  </article>
                ))}
              </div>
              <div style={{ ...box, marginTop: 20 }}>
                <h3>Add your own activity</h3>
                <form className="studio-fields" onSubmit={(e) => {
                  e.preventDefault();
                  if (!activity.title.trim()) return;
                  modify((prev) => ({ ...prev, customActivities: [...prev.customActivities, { ...activity, id: id(), title: activity.title.trim(), note: activity.note.trim() }] }));
                  setActivity({ title: "", category: "Our ideas", note: "" });
                }}>
                  <label htmlFor="custom-title">Activity or interest</label><input id="custom-title" style={s.input} maxLength={120} required value={activity.title} onChange={(e) => setActivity({ ...activity, title: e.target.value })} />
                  <label htmlFor="custom-category">Category</label><input id="custom-category" style={s.input} maxLength={60} required value={activity.category} onChange={(e) => setActivity({ ...activity, category: e.target.value })} />
                  <label htmlFor="custom-note">Description, boundaries or questions</label><textarea id="custom-note" style={s.input} maxLength={2000} value={activity.note} onChange={(e) => setActivity({ ...activity, note: e.target.value })} />
                  <button style={primary} type="submit">Add privately</button>
                </form>
                {data.customActivities.length > 0 && <div style={buttonRow}>{data.customActivities.map((a) => <button key={a.id} style={secondary} onClick={() => { if (confirm("Remove " + a.title + "?")) modify((prev) => ({ ...prev, customActivities: prev.customActivities.filter((x) => x.id !== a.id), ready: { A: false, B: false } })); }}>Remove: {a.title}</button>)}</div>}
              </div>
            </>
          )}
          {section === "Our choices" && (
            <>
              <h2 style={s.h2}>Yes / No / Maybe — separate turns</h2>
              <p style={intro}>Each partner chooses their own answers. Seal your turn before passing the device. Mutual matches are shown only when both have finished. A Yes is an invitation to talk, never consent for a future encounter.</p>
              {!ballot ? (
                <div style={box}>
                  <p>{data.ready.A ? "Partner A: sealed" : "Partner A: not sealed"} · {data.ready.B ? "Partner B: sealed" : "Partner B: not sealed"}</p>
                  <div style={buttonRow}>
                    <button type="button" onClick={() => openBallot("A")} style={primary}>Partner A — {data.ready.A ? "reset sealed answers" : "answer privately"}</button>
                    <button type="button" onClick={() => openBallot("B")} style={primary}>Partner B — {data.ready.B ? "reset sealed answers" : "answer privately"}</button>
                  </div>
                  <button type="button" disabled={!data.ready.A || !data.ready.B} style={secondary} onClick={() => setShowMatches(!showMatches)}>{showMatches ? "Hide" : "Reveal"} mutual Yes matches</button>
                  {showMatches && data.ready.A && data.ready.B && <div style={{ marginTop: 16 }}>
                    <h3>Mutual Yes interests</h3>
                    {mutualYes(data.votes, data.ready, activities).length ? mutualYes(data.votes, data.ready, activities).map((a) => <p key={a.id}>{a.title}</p>) : <p>Nothing matched as mutual Yes yet. That's completely fine.</p>}
                    <p className="muted">Individual answers, No and Hard limit selections are not displayed in this view. Partners sharing the vault passphrase are not technically isolated from each other's underlying records.</p>
                  </div>}
                </div>
              ) : (
                <div style={box}>
                  <h3>Partner {ballot}'s private turn</h3>
                  <p className="muted">Please have the other partner look away. An answer can always be changed. Marking Done hides your answers in this interface. To answer again, you must erase and re-enter them. It is not secured with a separate partner password.</p>
                  {activities.map((a) => <div key={a.id} style={{ padding: "12px 0", borderBottom: "1px solid " + C.rule }}>
                    <label htmlFor={"vote-" + a.id}>{a.title}</label>
                    <select id={"vote-" + a.id} style={{ ...s.input, margin: 0 }} value={data.votes[ballot][a.id] || ""} onChange={(e) => {
                      const selected = e.target.value;
                      modify((prev) => ({ ...prev, votes: { ...prev.votes, [ballot]: { ...prev.votes[ballot], [a.id]: selected } }, ready: { ...prev.ready, [ballot]: false } }));
                    }}>{VOTE_OPTIONS.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}</select>
                  </div>)}
                  <button type="button" style={{ ...primary, marginTop: 20 }} onClick={() => { modify((prev) => ({ ...prev, ready: { ...prev.ready, [ballot]: true } })); setBallot(null); }}>Seal my answers and hide this screen</button>
                </div>
              )}
            </>
          )}
          {section === "Journal" && (
            <>
              <h2 style={s.h2}>Fantasy and intimacy journal</h2>
              <p style={intro}>Write freely in your own words. Entries are saved inside this encrypted shared-device vault. “To discuss” is a label, not a separate partner-only permission system.</p>
              <form style={box} onSubmit={(e) => {
                e.preventDefault();
                if (!draft.title.trim() && !draft.body.trim()) return;
                modify((prev) => ({ ...prev, journal: editingId ? prev.journal.map((entry) => entry.id === editingId ? { ...entry, ...draft, updated: new Date().toISOString() } : entry) : [{ id: id(), ...draft, created: new Date().toISOString() }, ...prev.journal] }));
                setEditingId(null);
                setDraft({ title: "", body: "", tag: "Private reflection", shared: false });
              }}>
                <label htmlFor="journal-title">Title</label><input id="journal-title" maxLength={140} style={s.input} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="An idea to remember" />
                <label htmlFor="journal-body">Your own words</label><textarea id="journal-body" style={{ ...s.input, minHeight: 150 }} maxLength={20000} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} placeholder="Thoughts, fantasies, desires, questions or reflections…" />
                <label htmlFor="journal-tag">Tag</label><select id="journal-tag" style={s.input} value={draft.tag} onChange={(e) => setDraft({ ...draft, tag: e.target.value })}><option>Private reflection</option><option>Fantasy</option><option>To discuss</option><option>Aftercare</option></select>
                <label><input type="checkbox" checked={draft.shared} onChange={(e) => setDraft({ ...draft, shared: e.target.checked })} /> Mark as something I'd like to discuss</label>
                <button type="submit" style={primary}>{editingId ? "Save changes" : "Save encrypted entry"}</button>{editingId && <button type="button" style={{ ...secondary, marginLeft: 8 }} onClick={() => { setEditingId(null); setDraft({ title: "", body: "", tag: "Private reflection", shared: false }); }}>Cancel edit</button>}
              </form>
              {data.journal.map((entry) => <article key={entry.id} style={box}>
                <p style={s.label}>{entry.tag} · {entry.created?.slice(0, 10)}</p>
                <h3>{entry.title || "Untitled"}</h3>
                <p style={{ ...s.p, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{entry.body}</p>
                <label><input type="checkbox" checked={!!entry.shared} onChange={(e) => modify((prev) => ({ ...prev, journal: prev.journal.map((x) => x.id === entry.id ? { ...x, shared: e.target.checked } : x) }))} /> Mark to discuss</label>
                <div style={buttonRow}><button style={secondary} onClick={() => { setDraft({ title: entry.title, body: entry.body, tag: entry.tag, shared: !!entry.shared }); setEditingId(entry.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit entry</button>
                <button style={secondary} onClick={() => { if (confirm("Delete this entry?")) modify((prev) => ({ ...prev, journal: prev.journal.filter((x) => x.id !== entry.id) })); }}>Delete</button></div>
              </article>)}
            </>
          )}
          {section === "Planner" && (
            <>
              <h2 style={s.h2}>An evening together</h2>
              <p style={intro}>Plan atmosphere, wishes, boundaries and aftercare. A plan is not a promise or standing consent; either person can stop or change their mind.</p>
              <form style={box} onSubmit={(e) => { e.preventDefault(); modify((prev) => ({ ...prev, plans: [{ ...plan, id: id() }, ...prev.plans] })); setPlan({ date: today(), title: "", mood: "", agreed: "", boundaries: "", aftercare: "" }); }}>
                <label htmlFor="plan-date">Date</label><input id="plan-date" type="date" style={s.input} value={plan.date} onChange={(e) => setPlan({ ...plan, date: e.target.value })} />
                {[["title", "Name for the evening"], ["mood", "Mood, music, atmosphere"], ["agreed", "Things to discuss or mutually agree"], ["boundaries", "Boundaries and stop signals"], ["aftercare", "Aftercare, comfort and follow-up"]].map(([field, label]) => <div key={field}>
                  <label htmlFor={"plan-" + field}>{label}</label>
                  <textarea id={"plan-" + field} style={{ ...s.input, minHeight: field === "title" ? 55 : 80 }} maxLength={2000} value={plan[field]} onChange={(e) => setPlan({ ...plan, [field]: e.target.value })} />
                </div>)}
                <button type="submit" style={primary} disabled={!plan.title.trim()}>Save encrypted plan</button>
              </form>
              {data.plans.map((entry) => <article key={entry.id} style={box}><h3>{entry.date} · {entry.title}</h3>
                {[["Mood", entry.mood], ["Wishes", entry.agreed], ["Boundaries", entry.boundaries], ["Aftercare", entry.aftercare]].filter(([, v]) => !!v).map(([name, value]) => <p key={name} style={{ ...s.p, whiteSpace: "pre-wrap" }}><strong>{name}:</strong> {value}</p>)}
                <button style={secondary} onClick={() => { if (confirm("Delete this plan?")) modify((prev) => ({ ...prev, plans: prev.plans.filter((x) => x.id !== entry.id) })); }}>Delete</button>
              </article>)}
            </>
          )}
          {section === "Conversation" && (
            <>
              <h2 style={s.h2}>Candid conversation cards</h2>
              <div style={{ ...box, minHeight: 210, borderColor: "#a37886" }}>
                <p style={s.label}>{CONVERSATION_CARDS[cardIndex].category} · {cardIndex + 1} / {CONVERSATION_CARDS.length}</p>
                <h3 style={{ fontFamily: "Georgia,serif", fontSize: 25, lineHeight: 1.5 }}>{CONVERSATION_CARDS[cardIndex].question}</h3>
                <div style={buttonRow}><button style={secondary} onClick={() => setCardIndex((cardIndex - 1 + CONVERSATION_CARDS.length) % CONVERSATION_CARDS.length)}>Previous</button>
                  <button style={primary} onClick={() => setCardIndex((cardIndex + 1) % CONVERSATION_CARDS.length)}>Next question</button></div>
              </div>
              <p style={intro}>Feel free to pass on any question. No answer creates an obligation.</p>
            </>
          )}
          {section === "Check-ins" && (
            <>
              <h2 style={s.h2}>Connection, desire and wellbeing</h2>
              <p style={intro}>A gentle reflection rather than a scorecard for sex. Low desire or saying no is normal and valid.</p>
              <form style={box} onSubmit={(e) => { e.preventDefault(); modify((prev) => ({ ...prev, checkins: [{ ...checkin, id: id() }, ...prev.checkins] })); setCheckin({ date: today(), connection: "3", desire: "3", mood: "Neutral", notes: "" }); }}>
                <label htmlFor="checkin-date">Date</label><input id="checkin-date" type="date" style={s.input} value={checkin.date} onChange={(e) => setCheckin({ ...checkin, date: e.target.value })} />
                <label htmlFor="checkin-mood">How am I feeling?</label><select id="checkin-mood" style={s.input} value={checkin.mood} onChange={(e) => setCheckin({ ...checkin, mood: e.target.value })}>{["Relaxed", "Happy", "Neutral", "Tired", "Anxious", "Disconnected", "Other"].map((v) => <option key={v}>{v}</option>)}</select>
                {[["connection", "Sense of connection today"], ["desire", "My current desire for intimacy"], ["satisfaction", "How satisfied do I feel with our intimacy?"]].map(([field, label]) => <div key={field}>
                  <label htmlFor={"checkin-" + field}>{label} ({checkin[field]} / 5)</label><input id={"checkin-" + field} type="range" min="1" max="5" value={checkin[field]} onChange={(e) => setCheckin({ ...checkin, [field]: e.target.value })} style={{ width: "100%" }} />
                </div>)}
                <label htmlFor="checkin-notes">Reflection (optional)</label><textarea id="checkin-notes" style={s.input} maxLength={3000} value={checkin.notes} onChange={(e) => setCheckin({ ...checkin, notes: e.target.value })} />
                <button type="submit" style={primary}>Save private check-in</button>
              </form>
              {data.checkins.map((entry) => <article key={entry.id} style={box}><strong>{entry.date} · {entry.mood}</strong><p>Connection: {entry.connection}/5 · Desire: {entry.desire}/5 · Satisfaction: {entry.satisfaction || "—"}/5</p><p style={{ whiteSpace: "pre-wrap" }}>{entry.notes}</p><button style={secondary} onClick={() => { if (confirm("Delete this check-in?")) modify((prev) => ({ ...prev, checkins: prev.checkins.filter((x) => x.id !== entry.id) })); }}>Delete</button></article>)}
            </>
          )}
          {section === "Privacy" && (
            <>
              <h2 style={s.h2}>Privacy and backups</h2>
              <div style={box}>
                <p style={intro}>New Studio entries are encrypted with AES-256-GCM using a passphrase-derived key. The passphrase exists only in memory while unlocked. No backend, account system, or automatic partner sync is implemented.</p>
                <p style={intro}><strong>Limits:</strong> Anyone with your device and passphrase can access this shared vault. Encryption does not protect an unlocked browser, compromised device, browser extensions, screenshots or backups. Legacy PowerApp screens still use unencrypted localStorage. For separate partner privacy and cross-device sync, a separately designed authenticated service would be required.</p>
                <div style={buttonRow}><button style={primary} type="button" onClick={exportBackup}>Export encrypted backup</button><button style={secondary} type="button" onClick={lock}>Lock now</button><button style={secondary} type="button" onClick={deleteVault}>Delete vault on this device</button></div>
                <p className="muted">You must remember your passphrase to open an exported backup. Deleting browser data also deletes this vault. An encrypted backup contains sensitive metadata (format/version) but no readable journal entries.</p>
              </div>
              <button style={secondary} onClick={() => onNavigate("privacy")}>Open legacy Privacy controls</button>
            </>
          )}
          <div style={{ marginTop: 24, paddingTop: 12, borderTop: "1px solid " + C.rule, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button style={secondary} onClick={() => onNavigate("covenant")}>Optional Christian marriage perspective</button>
            <button style={secondary} onClick={() => onNavigate("resources")}>Safety and Australian support resources</button>
          </div>
        </>
      )}
    </div>
  );
}
