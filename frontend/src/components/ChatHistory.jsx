export default function ChatHistory({ chats, activeChatId, onSelect, onDelete, onNew }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>

      {/* Section label */}
      <div style={{ fontSize: 11, color: "#666", padding: "4px 6px 8px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        Recent
      </div>

      {/* New chat button */}
      <button onClick={onNew}
        style={{ width: "100%", padding: "9px 0", borderRadius: 8, background: "#6c63ff", color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>＋</span> New Chat
      </button>

      {/* Empty state */}
      {chats.length === 0 && (
        <div style={{ color: "#555", fontSize: 12, padding: "8px 6px" }}>
          No chats yet. Start a new one!
        </div>
      )}

      {/* Chat list */}
      {chats.map(c => (
        <ChatRow
          key={c.id}
          chat={c}
          active={c.id === activeChatId}
          onSelect={() => onSelect(c.id)}
          onDelete={() => onDelete(c.id)}
        />
      ))}
    </div>
  );
}

function ChatRow({ chat, active, onSelect, onDelete }) {
  return (
    <div
      onClick={onSelect}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 8px", borderRadius: 7, cursor: "pointer",
        background: active ? "rgba(108,99,255,0.25)" : "transparent",
        marginBottom: 2, transition: "background 0.15s"
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <span style={{ fontSize: 12 }}>💬</span>

      {/* Chat title */}
      <span style={{ color: "#ccc", fontSize: 12, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {chat.title}
      </span>

      {/* Time ago */}
      <span style={{ color: "#555", fontSize: 10, whiteSpace: "nowrap" }}>
        {formatTime(chat.updatedAt)}
      </span>

      {/* Delete */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        title="Delete chat"
        style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 15, padding: "0 2px", lineHeight: 1, flexShrink: 0 }}>
        ×
      </button>
    </div>
  );
}

function formatTime(ts) {
  if (!ts) return "";
  const diffMins = Math.floor((Date.now() - ts) / 60000);
  if (diffMins < 1)    return "just now";
  if (diffMins < 60)   return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return new Date(ts).toLocaleDateString();
}