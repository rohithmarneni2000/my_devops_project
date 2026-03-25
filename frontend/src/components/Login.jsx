import { useState } from "react";

const USERS_KEY = "nc_users";

function getStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function setStorage(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

export function initUsers() {
  const u = getStorage(USERS_KEY, null);
  if (!u) {
    setStorage(USERS_KEY, [
      { id: "1", name: "Rohith", email: "rohith@demo.com", password: "demo123", avatar: "RO" }
    ]);
  }
}

export default function Login({ onLogin }) {
  const [tab,           setTab]          = useState("login");
  const [form,          setForm]         = useState({ name: "", email: "", password: "", confirm: "" });
  const [err,           setErr]          = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleLogin = () => {
    setErr("");
    const users = getStorage(USERS_KEY, []);
    const u = users.find(x => x.email === form.email && x.password === form.password);
    if (!u) return setErr("Invalid email or password.");
    const session = { userId: u.id, name: u.name, email: u.email, avatar: u.avatar };
    setStorage("nc_session", session);
    onLogin(session);
  };

  const handleRegister = () => {
    setErr("");
    if (!form.name.trim())              return setErr("Name is required.");
    if (!form.email.includes("@"))      return setErr("Enter a valid email.");
    if (form.password.length < 6)       return setErr("Password must be at least 6 characters.");
    if (form.password !== form.confirm) return setErr("Passwords do not match.");
    const users = getStorage(USERS_KEY, []);
    if (users.find(x => x.email === form.email)) return setErr("Email already registered.");
    const avatar  = form.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    const newUser = { id: Date.now().toString(), name: form.name, email: form.email, password: form.password, avatar };
    setStorage(USERS_KEY, [...users, newUser]);
    const session = { userId: newUser.id, name: newUser.name, email: newUser.email, avatar: newUser.avatar };
    setStorage("nc_session", session);
    onLogin(session);
  };

  const handleGoogle = () => {
    setGoogleLoading(true);
    setTimeout(() => {
      const session = { userId: "g_" + Date.now(), name: "Google User", email: "user@gmail.com", avatar: "GU" };
      setStorage("nc_session", session);
      onLogin(session);
    }, 1200);
  };

  const inp = {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    border: "1px solid #ddd", fontSize: 14, outline: "none",
    boxSizing: "border-box", marginBottom: 12, fontFamily: "inherit"
  };
  const btn = (bg, color = "#fff") => ({
    width: "100%", padding: "11px", borderRadius: 8,
    background: bg, color, border: "none", fontWeight: 600,
    fontSize: 14, cursor: "pointer", marginBottom: 10
  });

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f5f7ff 0%,#ede9ff 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "36px 32px", width: 380, boxShadow: "0 8px 40px rgba(108,99,255,0.13)" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#6c63ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 18 }}>🤖</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#1a1a2e" }}>NeuralChat</div>
            <div style={{ fontSize: 12, color: "#888" }}>AI Assistant</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "#f4f4f8", borderRadius: 8, marginBottom: 20, padding: 3 }}>
          {["login", "register"].map(t => (
            <button key={t} onClick={() => { setTab(t); setErr(""); }}
              style={{ flex: 1, padding: "8px 0", borderRadius: 6, border: "none", background: tab === t ? "#fff" : "transparent", fontWeight: tab === t ? 600 : 400, fontSize: 13, cursor: "pointer", color: tab === t ? "#6c63ff" : "#888", boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
              {t === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Error */}
        {err && (
          <div style={{ background: "#fff0f0", color: "#c0392b", borderRadius: 7, padding: "8px 12px", fontSize: 13, marginBottom: 12 }}>
            {err}
          </div>
        )}

        {/* Fields */}
        {tab === "register" && (
          <input style={inp} placeholder="Full name" value={form.name} onChange={e => upd("name", e.target.value)} />
        )}
        <input style={inp} placeholder="Email address" type="email" value={form.email} onChange={e => upd("email", e.target.value)} />
        <input style={inp} placeholder="Password" type="password" value={form.password} onChange={e => upd("password", e.target.value)} />
        {tab === "register" && (
          <input style={inp} placeholder="Confirm password" type="password" value={form.confirm} onChange={e => upd("confirm", e.target.value)} />
        )}

        {/* Submit */}
        <button onClick={tab === "login" ? handleLogin : handleRegister} style={btn("#6c63ff")}>
          {tab === "login" ? "Sign In" : "Create Account"}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0 10px" }}>
          <div style={{ flex: 1, height: 1, background: "#eee" }} />
          <span style={{ fontSize: 12, color: "#aaa" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "#eee" }} />
        </div>

        {/* Google button */}
        <button onClick={handleGoogle} disabled={googleLoading}
          style={{ ...btn("#fff", "#333"), border: "1px solid #ddd", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {googleLoading ? "Connecting…" : "Continue with Google"}
        </button>

      </div>
    </div>
  );
}