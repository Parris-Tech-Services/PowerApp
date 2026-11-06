import React from "react";

export default function MoreTab({ C, s, onNavigate }) {
  return (
    <div style={s.page}>
      <h1 style={s.h1}>Settings</h1>
      <p style={s.p}>Privacy controls, support resources and an optional private adult marriage portal.</p>

      <button onClick={() => onNavigate("resources")} style={{
        ...s.card, width: "100%", textAlign: "left", cursor: "pointer", border: `1px solid ${C.rule}`,
        marginBottom: 16, display: "block"
      }}>
        <p style={{ fontFamily: s.h1.fontFamily, fontSize: 22, color: C.ink, marginBottom: 6 }}>Resources & Support</p>
        <p style={{ ...s.p, fontSize: 14, marginBottom: 0 }}>Australian and international resources, crisis hotlines, and books.</p>
      </button>

      <button aria-label="Christian NSFW mode" onClick={() => onNavigate("christian-nsfw")} style={{
        ...s.card, width: "100%", textAlign: "left", cursor: "pointer",
        border: "1px solid #9e647f", marginBottom: 16, display: "block",
        background: C.warmWhite
      }}>
        <p style={{ fontFamily: s.h1.fontFamily, fontSize: 23, color: C.ink, marginBottom: 6 }}>Christian NSFW mode (18+)</p>
        <p style={{ ...s.p, fontSize: 14, marginBottom: 0 }}>Enter a passphrase-locked marriage portal with frank adult topics, private notes, intimacy planning, scripture reflections and aftercare.</p>
      </button>

      <button onClick={() => onNavigate("privacy")} style={{
        ...s.card, width: "100%", textAlign: "left", cursor: "pointer", border: `1px solid ${C.rule}`,
        display: "block"
      }}>
        <p style={{ fontFamily: s.h1.fontFamily, fontSize: 22, color: C.ink, marginBottom: 6 }}>Privacy & Data</p>
        <p style={{ ...s.p, fontSize: 14, marginBottom: 0 }}>Manage your local data, device swapping, and security information.</p>
      </button>

      <div style={{ ...s.warnBox, marginTop: 24 }}>
        <p style={{ ...s.p, fontSize: 13, marginBottom: 0 }}>
          <strong>Panic Clear:</strong> The red button in the header instantly deletes all your local data and redirects to a blank page.
        </p>
      </div>

      <div style={{ marginTop: 40, textAlign: "center", opacity: 0.1 }}>
        <button 
          onClick={() => onNavigate("covenant")}
          style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 10 }}
          aria-label="Covenant"
        >
          ·
        </button>
      </div>
    </div>
  );
}
