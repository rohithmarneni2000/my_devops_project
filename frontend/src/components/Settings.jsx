import { useState } from "react";

export const defaultSettings = {
  theme:          "light",
  fontSize:       "medium",
  sendOnEnter:    true,
  showTimestamps: true,
  systemPrompt:   "You are a helpful assistant specialized in DevOps, cloud, and programming.",
};

export default function Settings({ settings, onSave, onClose }) {
  const [s, setS] = useState({ ...settings });
  const upd = (k, v) => setS(p => ({ ...p, [k]: v }));

  const lbl = { fontSize: 13, color: "#555", fontWeight: 500, marginBottom: 4, display: "block" };
  const row = { marginBottom: 18 };
  const sel = { width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #ddd", fontSize: 13, fontFamily: "inherit" };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>

      <div style={{ background: "#fff", borderRadius: 14, width: 440, maxHeight: "85vh", overflowY: "auto", padding: "28px 28px 20px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 17 }}>Settings</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#888", lineHeight: 1 }}>×</button>
        </div>

        {/* Theme */}
        <div style={row}>
          <label style={lbl}>Theme</label>
          <select style={sel} value={s.theme} onChange={e => upd("theme", e.target.value)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>

        {/* Font size */}
        <div style={row}>
          <label style={lbl}>Font Size</label>
          <select style={sel} value={s.fontSize} onChange={e => upd("fontSize", e.target.value)}>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        {/* Send on Enter */}
        <div style={{ ...row, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label style={{ ...lbl, marginBottom: 0 }}>Send on Enter</label>
          <input type="checkbox" checked={s.sendOnEnter}
            onChange={e => upd("sendOnEnter", e.target.checked)}
            style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#6c63ff" }} />
        </div>

        {/* Show timestamps */}
        <div style={{ ...row, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label style={{ ...lbl, marginBottom: 0 }}>Show timestamps</label>
          <input type="checkbox" checked={s.showTimestamps}
            onChange={e => upd("showTimestamps", e.target.checked)}
            style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#6c63ff" }} />
        </div>

        {/* System prompt */}
        <div style={row}>
          <label style={lbl}>System Prompt</label>
          <textarea rows={3} style={{ ...sel, resize: "vertical" }}
            value={s.systemPrompt}
            onChange={e => upd("systemPrompt", e.target.value)} />
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13 }}>
            Cancel
          </button>
          <button onClick={() => onSave(s)}
            style={{ flex: 1, padding: "10px", borderRadius: 8, background: "#6c63ff", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
            Save Settings
          </button>
        </div>

      </div>
    </div>
  );
}