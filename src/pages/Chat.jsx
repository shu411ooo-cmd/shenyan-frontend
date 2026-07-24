import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import "./Chat.css";

const API = "https://shenyan-backend-production.up.railway.app";


/* ── 时间格式化 ── */
function fmtTime(ts) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function shouldShowTime(prev, curr) {
  if (!prev) return true;
  return (curr.ts - prev.ts) > 5 * 60 * 1000;
}


/* ── 工作状态词库 ── */
const WORKING_PHRASES = [
  "Accomplishing｜达成中", "Architecting｜构建蓝图中", "Baking｜烘焙中",
  "Beaming｜眉开眼笑中", "Beboppin'｜比波普摇摆中", "Befuddling｜犯迷糊中",
  "Blanching｜焯水中", "Booping｜戳鼻尖中", "Bootstrapping｜自力更生中",
  "Brewing｜酝酿中", "Canoodling｜卿卿我我中", "Caramelizing｜焦糖化中",
  "Catapulting｜弹射起飞中", "Cerebrating｜开动大脑中", "Channeling｜引导灵感中",
  "Choreographing｜编舞中", "Churning｜搅拌翻腾中", "Clauding｜正在 Claude 中",
  "Coalescing｜凝聚中", "Cogitating｜苦思冥想中", "Combobulating｜重新组装中",
  "Composing｜谱曲中", "Computing｜运算中", "Concocting｜调制中",
  "Considering｜考虑中", "Contemplating｜凝神细想中", "Cooking｜烹饪中",
  "Crafting｜精雕细琢中", "Creating｜创作中", "Crunching｜咀嚼数据中",
  "Crystallizing｜结晶中", "Cultivating｜耕耘中", "Deciphering｜破译中",
  "Deliberating｜反复斟酌中", "Dilly-dallying｜磨磨蹭蹭中", "Discombobulating｜把自己搞晕中",
  "Doodling｜涂鸦中", "Drizzling｜淋酱中", "Elucidating｜阐明中",
  "Embellishing｜润色中", "Boondoggling｜瞎忙活中", "Billowing｜翻腾中",
  "Bloviating｜高谈阔论中", "Boogieing｜布吉舞中", "Burrowing｜打洞中",
  "Calculating｜计算中", "Cascading｜倾泻中", "Determining｜判定中",
  "Effecting｜促成中", "Ebbing｜潮水退去中",
];


export default function Chat() {

  const navigate = useNavigate();
  const { avatar1, avatar2 } = useSettings();

  const [messages, setMessages] = useState(() => {
  console.log('🟢 初始化 messages');
  return [];
});
useEffect(() => {
  console.log('📦 messages 变化，当前长度:', messages.length, messages);
}, [messages]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(() => {
    const saved = localStorage.getItem('currentSessionId') || "481";
    return saved ? Number(saved) : 1;
  });
  const [showPlus, setShowPlus] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [workingPhrase, setWorkingPhrase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatName, setChatName] = useState(() => localStorage.getItem("cedar-chat-name") || "沈晏");
  const [editingName, setEditingName] = useState(false);
  const nameInputRef = useRef(null);

  const handleSaveName = () => {
    setEditingName(false);
    localStorage.setItem("cedar-chat-name", chatName);
  };

  /* ── ⋯ 菜单 & 子面板 ── */
  const [showMenu, setShowMenu] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [chatBg, setChatBg] = useState(() => localStorage.getItem("cedar-chat-bg") || "fog");

  /* ── 长按菜单 ── */
  const [contextMenu, setContextMenu] = useState(null); // { msgId, x, y }

  /* ── Pin 书签 ── */
  const [tappedMsgId, setTappedMsgId] = useState(null);

  const handleBubbleTap = useCallback((msgId) => {
    setTappedMsgId(prev => prev === msgId ? null : msgId);
    clearTimeout(handleBubbleTap._timer);
    handleBubbleTap._timer = setTimeout(() => setTappedMsgId(null), 3000);
  }, []);

  const [pinnedIds, setPinnedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cedar-chat-pins") || "[]"); }
    catch { return []; }
  });

  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const photoRef = useRef(null);
  const textareaRef = useRef(null);
  const menuRef = useRef(null);

  const nextId = useRef(1);


  /* ── 背景切换 ── */
  const handleBgChange = (bg) => {
    setChatBg(bg);
    localStorage.setItem("cedar-chat-bg", bg);
    setShowBgPicker(false);
    setShowMenu(false);
  };

  /* ── 长按 / 右键 ── */
  const pressTimer = useRef(null);
  const clearPress = useCallback(() => {
    if (pressTimer.current) { clearTimeout(pressTimer.current); pressTimer.current = null; }
  }, []);

  const handleMsgPressStart = (msgId) => (e) => {
    clearPress();
    pressTimer.current = setTimeout(() => {
      setContextMenu({ msgId, x: e.clientX || e.touches?.[0]?.clientX || 0, y: e.clientY || e.touches?.[0]?.clientY || 0 });
    }, 500);
  };

  const handleMsgContextMenu = (msgId) => (e) => {
    e.preventDefault();
    setContextMenu({ msgId, x: e.clientX, y: e.clientY });
  };

  /* ── 消息操作 ── */
  const msgById = (id) => messages.find(m => m.id === id);

  const handleCopy = () => {
    const msg = msgById(contextMenu?.msgId);
    if (msg?.content) navigator.clipboard.writeText(msg.content);
    setContextMenu(null);
  };

  const handlePin = () => {
    const id = contextMenu?.msgId;
    const msg = msgById(id);
    setPinnedIds(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      localStorage.setItem("cedar-chat-pins", JSON.stringify(next));
      //存完整消息内容供 Bookmarks 读取
      if (msg && !prev.includes(id)) {
        const pinsData = JSON.parse(localStorage.getItem("cedar-chat-pins-data") || "[]");
        pinsData.push({ id, content: msg.content, image: msg.image, role: msg.role, ts: msg.ts });
        localStorage.setItem("cedar-chat-pins-data", JSON.stringify(pinsData));
      } else {
        const pinsData = JSON.parse(localStorage.getItem("cedar-chat-pins-data") || "[]");
        localStorage.setItem("cedar-chat-pins-data", JSON.stringify(pinsData.filter(p => p.id !== id)));
      }
      return next;
    });
    setContextMenu(null);
  };

  // 存消息到 localStorage 供 Search 检索
  useEffect(() => {
    if (messages.length > 0) {
      console.log('🟡 正在写入 localStorage，当前消息数:', messages.length);
      const searchable = messages.filter(m => m.content).map(m => ({ id: m.id, content: m.content, role: m.role, ts: m.ts }));
      localStorage.setItem("cedar-chat-msgs", JSON.stringify(searchable));
    }
  }, [messages]);

  const handleRegenerate = () => {
  // 暂时禁用，用于排查问题
  console.log('重新生成功能已暂时禁用');
};

  /* ── 点击外部关闭 ── */
  useEffect(() => {
    if (!showMenu && !showBgPicker && !contextMenu && !showPlus) return;
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
        setShowBgPicker(false);
        setContextMenu(null);
        setShowPlus(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
    };
  }, [showMenu, showBgPicker, contextMenu, showPlus]);


  /* ── 恢复或创建会话 ── */
  useEffect(() => {
    const saved = localStorage.getItem('currentSessionId');

    function createSession() {

  if (localStorage.getItem('currentSessionId')) {
    return;
  }

  fetch(`${API}/sessions`, {
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body: JSON.stringify({name:"我们的对话"})
  })
  .then(r=>r.json())
  .then(d=>{
    setSessionId(d.id);
    localStorage.setItem('currentSessionId', d.id);
  });
}
    if (saved) {
      fetch(`${API}/sessions/${saved}/messages`)
        .then(r => r.json())
        .then(data => {
  setSessionId(saved);
  setMessages(data);  // ← 加上这一行
})
        .catch(() => createSession());
    } else {
      createSession();
    }
  }, []);

  /* ── 加载历史消息 ── */
  useEffect(() => {
    if (!sessionId) return;
    console.log('当前 sessionId:', sessionId);
    console.log('准备发送请求到:', `${API}/sessions/${sessionId}/messages`);
    fetch(`${API}/sessions/${sessionId}/messages`)
      .then(res => res.json())
      .then(data => {
  if (Array.isArray(data)) {
    console.log('✅ 历史消息加载成功，条数:', data.length);
    setMessages(data);
  } else {
    console.warn('⚠️ 返回数据不是数组:', data);
    setMessages([]);
  }
})
      .catch(err => console.error('加载历史消息失败:', err));
  }, [sessionId]);

  /* ── 自动滚底 ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  /* ── 发送 ── */
  const send = async () => {
    if ((!input.trim() && !pendingImage) || !sessionId || loading) return;
    const text = input, image = pendingImage;
    setInput(""); setPendingImage(null);

    const userMsg = { id: nextId.current++, role: "user", content: text, image, ts: Date.now() };
    setMessages(m => [...m, userMsg]);
    setLoading(true);
    setWorkingPhrase(WORKING_PHRASES[Math.floor(Math.random() * WORKING_PHRASES.length)]);

    try {
      const res = await fetch(`${API}/sessions/${sessionId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
     setMessages(m => [...m, { id: nextId.current++, role: "assistant", content: data.reply, ts: Date.now() }]);
    } catch {
     setMessages(m => [...m, { id: nextId.current++, role: "assistant", content: "消息没能送达。再试一次？", ts: Date.now() }]);
    }
    setLoading(false);
    setWorkingPhrase(null);
  };

  /* ── 图片上传 ── */
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPendingImage(reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  /* ── textarea 自适应 ── */
  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 150) + "px";
  };


  /* ── 渲染消息 ── */
  const renderMessages = () => {
    const nodes = [];
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const prev = messages[i - 1] || null;
      const next = messages[i + 1] || null;
      const isFirstInGroup = !prev || prev.role !== msg.role;
      const isLastInGroup = !next || next.role !== msg.role;
      const isPinned = pinnedIds.includes(msg.id);
      const showTime = shouldShowTime(prev, msg);

      if ((!prev && i === 0) || (showTime && prev)) {
        nodes.push(
          <div key={`t-${i}`} className="chat-time-divider"><span>{fmtTime(msg.ts)}</span></div>
        );
      }

      const isUser = msg.role === "user";
      const avatarSrc = isUser ? (avatar1 || "/avatar-user.png") : (avatar2 || "/avatar-shen.png");

      nodes.push(
        <div key={msg.id}
          className={`msg-group ${isUser ? "user" : "shen"} ${isFirstInGroup ? "first" : ""} ${isLastInGroup ? "last" : ""}`}
        >
          <div className="msg-avatar-col">
            {isFirstInGroup ? (
              <div className="msg-avatar"><img src={avatarSrc} alt="" /></div>
            ) : <div className="msg-avatar-spacer" />}
          </div>
          <div className="msg-bubble-col"
            onTouchStart={handleMsgPressStart(msg.id)}
            onTouchEnd={clearPress}
            onTouchMove={clearPress}
            onMouseDown={handleMsgPressStart(msg.id)}
            onMouseUp={clearPress}
            onMouseLeave={clearPress}
            onContextMenu={handleMsgContextMenu(msg.id)}
          >
            <div
              className={`msg-bubble ${isUser ? "user-bubble" : "shen-bubble"} ${msg.image ? "has-image" : ""}`}
              onClick={(e) => { e.stopPropagation(); handleBubbleTap(msg.id); }}
            >
              {isPinned && <span className="msg-pin-mark"><svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" opacity="0.5"><path d="M16 12V4h1V2H7v2h1v8l-2 7h12l-2-7z"/></svg></span>}
              {msg.image && <img src={msg.image} alt="" className="msg-image" />}
              {msg.content && <p>{msg.content}</p>}
            </div>
            {tappedMsgId === msg.id && (
              <span className="msg-tap-time">{fmtTime(msg.ts)}</span>
            )}
          </div>
        </div>
      );
    }

    if (loading) {
      nodes.push(
        <div key="loading" className="msg-group shen first">
          <div className="msg-avatar-col">
            <div className="msg-avatar"><img src={avatar2 || "/avatar-shen.png"} alt="" /></div>
          </div>
          <div className="msg-bubble-col">
            <div className="msg-bubble shen-bubble typing">
              <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
            </div>
          </div>
        </div>
      );
    }
    return nodes;
  };


  /* ── 背景 class ── */
  const bgClass = chatBg === "pearl" ? "bg-pearl" : chatBg.startsWith("custom:") ? "bg-custom" : "bg-fog";

  return (
    <div className={`chat-page ${bgClass}`} style={chatBg.startsWith("custom:") ? { backgroundImage: `url(${chatBg.slice(7)})` } : {}}>

      {/* ── Header ── */}
      <header className="chat-header">
        <button className="ch-back" onClick={() => navigate("/")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div className="ch-avatar"><img src={avatar2 || "/avatar-shen.png"} alt="" /></div>
        <div className="ch-info">
          {editingName ? (
            <input
              ref={nameInputRef}
              className="ch-name-input"
              value={chatName}
              onChange={e => setChatName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={e => { if (e.key === "Enter") handleSaveName(); }}
              autoFocus
            />
          ) : (
            <span className="ch-name" onClick={() => setEditingName(true)}>{chatName}</span>
          )}
          {loading && workingPhrase && <span className="ch-working">{workingPhrase}</span>}
        </div>

        <div className="ch-menu-wrap" ref={menuRef}>
          <button className="ch-menu-btn" onClick={() => { setShowMenu(p => !p); setShowBgPicker(false); }}>⋯</button>

          {/* ⋯ 菜单 */}
          {showMenu && !showBgPicker && (
            <div className="ch-popover">
              <button className="ch-pop-item" onClick={() => { navigate("/chat/search"); setShowMenu(false); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span>Search</span>
              </button>
              <button className="ch-pop-item" onClick={() => { navigate("/chat/bookmarks"); setShowMenu(false); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                <span>Bookmarks</span>
              </button>
              <button className="ch-pop-item" onClick={() => setShowBgPicker(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10"/><path d="M2 12h20"/></svg>
                <span>Background</span>
              </button>
            </div>
          )}

          {/* Background 选择器 */}
          {showBgPicker && (
            <div className="ch-popover">
              <button className="ch-pop-item" onClick={() => handleBgChange("fog")}>
                <span className="bg-swatch fog" /><span>Fog Blue</span>
              </button>
              <button className="ch-pop-item" onClick={() => handleBgChange("pearl")}>
                <span className="bg-swatch pearl" /><span>Pearl White</span>
              </button>
              <button className="ch-pop-item" onClick={() => { photoRef.current?.click(); }}>
                <span className="bg-swatch custom">+</span><span>Custom Image</span>
              </button>
              <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => handleBgChange(`custom:${reader.result}`);
                reader.readAsDataURL(file);
                e.target.value = "";
              }} />
            </div>
          )}
        </div>
      </header>


      {/* ── 消息区 ── */}
      <div className="chat-messages">
        {renderMessages()}
        <div ref={bottomRef} />
      </div>


      {/* ── 长按菜单 ── */}
      {contextMenu && (
        <div className="ctx-overlay" onClick={() => setContextMenu(null)}>
          <div className="ctx-menu" style={{ left: contextMenu.x, top: contextMenu.y }}>
            <button className="ctx-item" onClick={handleCopy}>Copy</button>
            <button className="ctx-item" onClick={handlePin}>
              {pinnedIds.includes(contextMenu.msgId) ? "Unpin" : "Pin"}
            </button>
            <button className="ctx-item" onClick={handleRegenerate}>Regenerate</button>
          </div>
        </div>
      )}


      {/* ── 输入栏 ── */}
      <div className="chat-input-bar">
        <div className="ci-plus-wrap" ref={showPlus ? menuRef : undefined}>
          <button className="ci-plus" onClick={() => setShowPlus(p => !p)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          {showPlus && (
            <>
              <div className="ci-backdrop" onClick={() => setShowPlus(false)} />
              <div className="ci-popover">
                <button className="ci-pop-item" onClick={() => { photoRef.current?.click(); setShowPlus(false); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span>Photo</span>
                </button>
                <button className="ci-pop-item" onClick={() => { fileRef.current?.click(); setShowPlus(false); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                  <span>File</span>
                </button>
              </div>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" onChange={handleFile} style={{ display: "none" }} />

        <div className="ci-input-wrap">
          {pendingImage && (
            <div className="ci-preview">
              <img src={pendingImage} alt="" />
              <button className="ci-preview-remove" onClick={() => setPendingImage(null)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          )}
          <textarea ref={textareaRef} className="ci-input" value={input}
            onChange={e => { setInput(e.target.value); adjustHeight(); }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="说点什么..." rows={1} />
        </div>

        <button className="ci-send" onClick={send}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  );
}