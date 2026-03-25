export function exportChat(chat) {
  if (!chat || chat.messages.length === 0) return false;

  const lines = [
    `# ${chat.title}`,
    `**Exported:** ${new Date().toLocaleString()}`,
    `**Messages:** ${chat.messages.length}`,
    "",
    "---",
    "",
  ];

  chat.messages.forEach(m => {
    const speaker = m.role === "user" ? "You" : "NeuralChat";
    const time    = new Date(m.ts).toLocaleTimeString();
    lines.push(`### ${speaker} — ${time}`);
    lines.push(m.content);
    lines.push("");
  });

  const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `${chat.title.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "")}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}