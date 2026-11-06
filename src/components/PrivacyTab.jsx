import React from "react";
import { font } from "../constants";
import { clearAllLocal, removeLocal } from "../utils/storage";

// Privacy and data management.
// Clears localStorage keys used by worksheets, plans, debriefs, or the whole app.
export default function PrivacyTab({ C, s }) {


  const handlePanicClear = () => {
    if (confirm("This will instantly delete ALL saved data, notes, and plans. This cannot be undone. Proceed?")) {
      clearAllLocal();
      window.location.reload();
    }
  };

  const clearKeys = (keys, label) => {
    if (confirm(`Clear ${label}? This cannot be undone.`)) {
      keys.forEach(removeLocal);
      window.location.reload();
    }
  };

  return (
    <div style={s.page}>
      <p style={s.label}>Data & Privacy</p>
      <h1 style={s.h1}>Privacy Policy</h1>
      <p style={s.p}>Your privacy and safety are the highest priority. Here is how your data is handled.</p>

      <div style={s.card}>
        <span style={s.label}>Local-Only Storage</span>
        <p style={{ ...s.p, fontSize: 14, marginBottom: 12 }}>
          The new Private Studio vault encrypts journal entries, preferences, plans and check-ins before storing them locally. <strong>Older worksheets and plans remain unencrypted in browser storage</strong> until cleared using the controls below.
        </p>
        <ul style={{ color: C.softInk, paddingLeft: 18, lineHeight: 1.6, fontSize: 13 }}>
          <li>Nothing is ever sent to a server.</li>
          <li>We have no access to your data.</li>
          <li>No tracking or analytics are used.</li>
          <li>Someone with this device can read unencrypted legacy worksheets; access to the locked Studio vault additionally requires its passphrase.</li>
          <li>Private/incognito windows may delete saved data automatically.</li>
        </ul>
      </div>

      <div style={s.card}>
        <span style={s.label}>Device Swapping & Shared Access</span>
        <p style={{ ...s.p, fontSize: 14, marginBottom: 12 }}>
          PowerApp is built for <strong>device-swapping</strong>. Since all data is stored locally on this specific phone or computer:
        </p>
        <ul style={{ color: C.softInk, paddingLeft: 18, lineHeight: 1.6, fontSize: 13 }}>
          <li>One partner fills their worksheet, then passes the device to the other.</li>
          <li>You cannot 'sync' data between two different phones.</li>
          <li>This design ensures that your sensitive data never leaves your physical control.</li>
        </ul>
      </div>

      <div style={s.warnBox}>
        <span style={{ ...s.label, color: C.warnBorder }}>Device Security</span>
        <p style={{ ...s.p, fontSize: 14, marginBottom: 0 }}>
          Legacy worksheets are not encrypted. New Studio entries are AES-GCM encrypted while locked, but an unlocked vault, browser extensions or a compromised device can still expose them. The vault passphrase cannot be recovered. Panic Clear also deletes the encrypted vault.
        </p>
      </div>

      <div style={s.card}>
        <span style={s.label}>Data Management</span>
        <p style={{ ...s.p, fontSize: 14, marginBottom: 16 }}>
          You can clear your data at any time. Use this before sharing your device or if you want to start fresh.
        </p>
        
        <button 
          onClick={handlePanicClear}
          style={{ ...s.btn(), background: "#c44a3a", width: "100%", padding: "14px", marginBottom: 12 }}
        >
          Panic Clear: Delete All Data
        </button>
        <button
          onClick={() => clearKeys(["connect_partnerA", "connect_partnerB", "connect_hardLimitA", "connect_hardLimitB"], "worksheet responses")}
          style={{ ...s.btn("outline"), width: "100%", padding: "12px", marginBottom: 10 }}
        >
          Clear Worksheets
        </button>
        <button
          onClick={() => clearKeys(["tonight_plan", "prepare_checked"], "tonight's plan")}
          style={{ ...s.btn("outline"), width: "100%", padding: "12px", marginBottom: 10 }}
        >
          Clear Tonight Plan
        </button>
        <button
          onClick={() => clearKeys(["reflect_answers", "reflect_notes", "reflect_flags"], "debrief answers")}
          style={{ ...s.btn("outline"), width: "100%", padding: "12px", marginBottom: 10 }}
        >
          Clear Debrief Answers
        </button>
        
        <p style={{ ...s.p, fontSize: 12, textAlign: "center", color: C.muted, marginBottom: 0 }}>
          Panic Clear removes both the legacy data and the encrypted vault. Export a secure backup of the vault before deleting it if you want to keep those entries.
        </p>
      </div>

      <div style={s.card}>
        <span style={s.label}>Safety Disclaimer</span>
        <p style={{ ...s.p, fontSize: 13, marginBottom: 0, lineHeight: 1.6 }}>
          PowerApp is an educational tool. It is not a substitute for professional counseling, medical advice, or crisis support. If you feel unsafe, pressured, or coerced, please seek real-world support immediately from the resources listed in the Resources tab.
        </p>
      </div>
    </div>
  );
}
