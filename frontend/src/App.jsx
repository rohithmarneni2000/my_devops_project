import { useState, useEffect, useRef } from "react";
import Login, { initUsers }            from "./components/Login";
import Settings, { defaultSettings }   from "./components/Settings";
import ChatHistory                     from "./components/ChatHistory";
import { exportChat }                  from "./components/ExportChat";

// ─── storage helpers ─────────────────────────────────────────────────────────
const SESSION_KEY  = "nc_session";
const CHATS_KEY    = "nc_chats";
const SETTINGS_KEY = "nc_settings";

function getStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function setStorage(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ─── constants ────────────────────────────────────────────────────────────────
const SUGGESTIONS = ["Explain Kubernetes", "What is CI/CD?", "How does Docker work?", "Azure vs AWS"];
const FS_MAP      = { small: 13, medium: 15, large: 17 };

function Avatar({ initials, size = 32 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "#6c63ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600, fontSize: size * 0.35, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [session,      setSession]      = useState(() => getStorage(SESSION_KEY, null));
  const [chats,        setChats]        = useState(() => getStorage(CHATS_KEY, {}));
  const [activeChatId, setActiveChatId] = useState(null);
  const [settings,     setSettings]     = useState(() => getStorage(SETTINGS_KEY, defaultSettings));
  const [showSettings, setShowSettings] = useState(false);
  const [input,        setInput]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [toast,        setToast]        = useState("");
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => { initUsers(); }, []);
  useEffect(() => { setStorage(CHATS_KEY,    chats);    }, [chats]);
  useEffect(() => { setStorage(SETTINGS_KEY, settings); }, [settings]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chats, activeChatId, loading]);

  // ── helpers ──────────────────────────────────────────────────────────────
  const showToast  = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };
  const activeChat = activeChatId ? chats[activeChatId] : null;
  const fs         = FS_MAP[settings.fontSize] || 15;
  const userChats  = Object.values(chats)
    .filter(c => c.userId === session?.userId)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  // ── actions ───────────────────────────────────────────────────────────────
  const newChat = () => {
    const id   = Date.now().toString();
    const chat = { id, userId: session.userId, title: "New Chat", messages: [], createdAt: Date.now(), updatedAt: Date.now() };
    setChats(p => ({ ...p, [id]: chat }));
    setActiveChatId(id);
    setInput("");
  };

  const deleteChat = (id) => {
    setChats(p => { const n = { ...p }; delete n[id]; return n; });
    if (activeChatId === id) setActiveChatId(null);
  };

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content) return;
    setInput("");

    let chatId = activeChatId;
    let currentChat;

    if (!chatId || !chats[chatId]) {
      chatId      = Date.now().toString();
      currentChat = { id: chatId, userId: session.userId, title: content.slice(0, 40), messages: [], createdAt: Date.now(), updatedAt: Date.now() };
    } else {
      currentChat = { ...chats[chatId] };
      if (currentChat.messages.length === 0) currentChat.title = content.slice(0, 40);
    }

    const userMsg         = { id: Date.now().toString(), role: "user", content, ts: Date.now() };
    currentChat.messages  = [...currentChat.messages, userMsg];
    currentChat.updatedAt = Date.now();
    setChats(p => ({ ...p, [chatId]: currentChat }));
    setActiveChatId(chatId);
    setLoading(true);

    try {
      // Calls your existing FastAPI /chat endpoint
      const res  = await fetch("/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          message:       content,
          system_prompt: settings.systemPrompt,
        }),
      });
      const data  = await res.json();
      const reply = data.reply || "Sorry, something went wrong.";
      const aiMsg = { id: (Date.now() + 1).toString(), role: "assistant", content: reply, ts: Date.now() };
      setChats(p => ({
        ...p,
        [chatId]: { ...p[chatId], messages: [...p[chatId].messages, aiMsg], updatedAt: Date.now() }
      }));
    } catch {
      const errMsg = { id: (Date.now() + 1).toString(), role: "assistant", content: "⚠️ Connection error. Please try again.", ts: Date.now() };
      setChats(p => ({ ...p, [chatId]: { ...p[chatId], messages: [...p[chatId].messages, errMsg] } }));
    }
    setLoading(false);
  };

  const handleSaveSettings = (s) => { setSettings(s); setShowSettings(false); showToast("Settings saved!"); };
  const handleExport        = ()  => { exportChat(activeChat) ? showToast("Chat exported!") : showToast("No messages to export."); };
  const handleLogout        = ()  => { setStorage(SESSION_KEY, null); setSession(null); setActiveChatId(null); };

  // ── login guard ───────────────────────────────────────────────────────────
  if (!session) return <Login onLogin={s => setSession(s)} />;

  // ── main UI ───────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "system-ui, sans-serif", fontSize: fs, overflow: "hidden", background: "#f9f9fb" }}>

      {/* Toast notification */}
      {toast && (
        <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: "#6c63ff", color: "#fff", padding: "10px 22px", borderRadius: 30, fontWeight: 600, fontSize: 13, zIndex: 200, pointerEvents: "none" }}>
          {toast}
        </div>
      )}

      {/* Settings modal */}
      {showSettings && (
        <Settings settings={settings} onSave={handleSaveSettings} onClose={() => setShowSettings(false)} />
      )}

      {/* ── Sidebar ── */}
      {sidebarOpen && (
        <div style={{ width: 240, background: "#1a1a2e", display: "flex", flexDirection: "column", flexShrink: 0 }}>

          {/* Brand */}
          <div style={{ padding: "16px 14px 10px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>🤖</span>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>NeuralChat</span>
            </div>
          </div>

          {/* Chat history */}
          <ChatHistory
            chats={userChats}
            activeChatId={activeChatId}
            onSelect={setActiveChatId}
            onDelete={deleteChat}
            onNew={newChat}
          />

          {/* Bottom: settings + user info */}
          <div style={{ padding: "10px 10px 14px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <button onClick={() => setShowSettings(true)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 8px", borderRadius: 7, background: "none", border: "none", color: "#bbb", cursor: "pointer", fontSize: 13 }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}>
              ⚙️ Settings
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 8px", marginTop: 4 }}>
              <Avatar initials={session.avatar || "U"} size={28} />
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ color: "#eee", fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session.name}</div>
                <div style={{ color: "#666", fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session.email}</div>
              </div>
              <button onClick={handleLogout} title="Logout"
                style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 14 }}>⏏</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main chat area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "12px 18px", background: "#fff", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setSidebarOpen(p => !p)}
            style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#888" }}>☰</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a2e" }}>{activeChat?.title || "NeuralChat"}</div>
            <div style={{ fontSize: 11, color: "#6c63ff" }}>● GPT-3.5 Turbo · Online</div>
          </div>
          <button onClick={handleExport}
            style={{ background: "none", border: "1px solid #eee", borderRadius: 7, padding: "6px 12px", cursor: "pointer", fontSize: 12, color: "#555" }}>
            ↗ Export
          </button>
          <button onClick={() => setShowSettings(true)}
            style={{ background: "none", border: "1px solid #eee", borderRadius: 7, padding: "6px 12px", cursor: "pointer", fontSize: 12, color: "#555" }}>
            ⚙ Settings
          </button>
        </div>

        {/* Messages area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 18px" }}>
          {(!activeChat || activeChat.messages.length === 0) ? (

            // Empty / welcome state
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16 }}>
              <div style={{ fontSize: 40 }}>🤖</div>
              <div style={{ fontWeight: 700, fontSize: 20, color: "#1a1a2e" }}>How can I help you today?</div>
              <div style={{ color: "#888", fontSize: 14 }}>Ask me anything — coding, DevOps, cloud architecture, and more.</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => sendMessage(s)}
                    style={{ padding: "9px 16px", borderRadius: 20, border: "1px solid #ddd", background: "#fff", fontSize: 13, cursor: "pointer", color: "#444" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f0eeff"}
                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

          ) : (

            // Message bubbles
            <>
              {activeChat.messages.map(m => (
                <div key={m.id} style={{ display: "flex", gap: 10, marginBottom: 18, flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                  {m.role === "assistant" && (
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#6c63ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16 }}>🤖</div>
                  )}
                  {m.role === "user" && <Avatar initials={session.avatar || "U"} size={32} />}
                  <div style={{ maxWidth: "72%" }}>
                    <div style={{ background: m.role === "user" ? "#6c63ff" : "#fff", color: m.role === "user" ? "#fff" : "#222", padding: "10px 14px", borderRadius: m.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px", fontSize: fs, lineHeight: 1.6, border: m.role === "assistant" ? "1px solid #eee" : "none", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {m.content}
                    </div>
                    {settings.showTimestamps && (
                      <div style={{ fontSize: 10, color: "#aaa", marginTop: 3, textAlign: m.role === "user" ? "right" : "left" }}>
                        {new Date(m.ts).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#6c63ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
                  <div style={{ background: "#fff", border: "1px solid #eee", padding: "12px 16px", borderRadius: "4px 16px 16px 16px", display: "flex", gap: 5, alignItems: "center" }}>
                    {[0, 0.15, 0.3].map((d, i) => (
                      <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#6c63ff", animation: "bounce 0.9s infinite", animationDelay: `${d}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input bar */}
        <div style={{ padding: "12px 18px 16px", background: "#fff", borderTop: "1px solid #eee" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: "#f6f6fb", borderRadius: 12, padding: "8px 8px 8px 14px", border: "1px solid #e8e8f0" }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (settings.sendOnEnter && e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask me anything…"
              rows={1}
              style={{ flex: 1, border: "none", background: "transparent", resize: "none", outline: "none", fontSize: fs, lineHeight: 1.5, maxHeight: 120, overflowY: "auto", fontFamily: "inherit" }}
            />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
              style={{ width: 36, height: 36, borderRadius: 8, background: input.trim() ? "#6c63ff" : "#e0e0ea", border: "none", cursor: input.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <div style={{ textAlign: "center", fontSize: 11, color: "#bbb", marginTop: 8 }}>
            Press Enter to send · Shift+Enter for new line
          </div>
        </div>

      </div>

      <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.7);opacity:0.5} 40%{transform:scale(1);opacity:1} }`}</style>
    </div>
  );
}