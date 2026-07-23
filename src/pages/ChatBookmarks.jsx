import { useState, useEffect } from "react";
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

export default function ChatBookmarks() {
  const navigate = useNavigate();
  const [pins, setPins] = useState([]);

  const loadPins = () => {
    try {
      setPins(JSON.parse(localStorage.getItem("cedar-chat-pins-data") || "[]"));
    } catch { setPins([]); }
  };

  useEffect(() => { loadPins(); }, []);

  const handleUnpin = (id) => {
    const next = pins.filter(p => p.id !== id);
    setPins(next);
    localStorage.setItem("cedar-chat-pins-data", JSON.stringify(next));
    const ids = next.map(p => p.id);
    localStorage.setItem("cedar-chat-pins", JSON.stringify(ids));
  };

  return (
    <div className="chatsub-page">
      <header className="chatsub-header">
        <button className="chatsub-back" onClick={() => navigate("/chat")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span className="chatsub-title">Bookmarks</span>
      </header>

      <div className="chatsub-body">
        {pins.length === 0 ? (
          <div className="chatsub-empty-wrap">
            <p className="chatsub-empty-title">还没有珍藏的对话呢</p>
            <p className="chatsub-empty-desc">
              长按消息<br />
              <small>把它们夹进书签里吧</small>
            </p>
          </div>
        ) : (
          <div className="sub-card">
            <div className="sub-card-header">珍藏的对话 · {pins.length} 条</div>
            {[...pins].reverse().map(pin => (
              <div key={pin.id} className="sub-item" onContextMenu={(e) => { e.preventDefault(); handleUnpin(pin.id); }}>
                <div className="sub-item-content">{pin.content}</div>
                <div className="sub-item-meta">
                  <span>{pin.role === "user" ? "你" : "沈晏"} · {fmtDate(pin.ts)} {fmtTime(pin.ts)}</span>
                </div>
              </div>
            ))}
            <div className="sub-card-footer">长按消息可取消收藏</div>
          </div>
        )}
      </div>
    </div>
  );
}