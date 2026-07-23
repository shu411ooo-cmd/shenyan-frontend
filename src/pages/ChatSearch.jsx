import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./ChatSub.css";

function fmtDate(ts) {
  const d = new Date(ts);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}
function fmtTime(ts) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
}

export default function ChatSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const allMessages = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("cedar-chat-msgs") || "[]"); }
    catch { return []; }
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allMessages
      .filter(m => m.content?.toLowerCase().includes(q))
      .reverse();
  }, [query, allMessages]);

  /* 高亮匹配文字 */
  const highlight = (text, q) => {
    if (!q.trim()) return text;
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((p, i) =>
      regex.test(p) ? <mark key={i} className="sr-highlight">{p}</mark> : p
    );
  };

  return (
    <div className="chatsub-page">
      <header className="chatsub-header">
        <button className="chatsub-back" onClick={() => navigate("/chat")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span className="chatsub-title">Search</span>
      </header>

      <div className="chatsub-body">
        <div className="chatsub-search-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            placeholder="搜索聊天内容"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        {!query.trim() ? (
          <p className="chatsub-empty">输入关键词，在对话中搜索。</p>
        ) : results.length === 0 ? (
          <p className="chatsub-empty">没有找到相关内容。</p>
        ) : (
          <div className="sub-card">
            <div className="sub-card-header">搜索结果 · "{query}"</div>
            {results.map(m => (
              <div key={m.id} className="sub-item">
                <div className="sub-item-content">
                  {highlight(m.content, query)}
                </div>
                <div className="sub-item-meta">
                  <span>{m.role === "user" ? "你" : "沈晏"} · {fmtDate(m.ts)} {fmtTime(m.ts)}</span>
                </div>
              </div>
            ))}
            <div className="sub-card-footer">共 {results.length} 条结果</div>
          </div>
        )}
      </div>
    </div>
  );
}