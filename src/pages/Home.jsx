import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import "./Home.css";


/* ── Unicode 数学手写体转换 ── */
const SCRIPT_UPPER = {
  A:'𝒜', B:'𝐵', C:'𝒞', D:'𝒟', E:'𝐸', F:'𝐹', G:'𝒢', H:'𝐻', I:'𝐼',
  J:'𝒥', K:'𝒦', L:'𝐿', M:'𝑀', N:'𝒩', O:'𝒪', P:'𝒫', Q:'𝒬',
  R:'𝑅', S:'𝒮', T:'𝒯', U:'𝒰', V:'𝒱', W:'𝒲', X:'𝒳', Y:'𝒴', Z:'𝒵'
};

const SCRIPT_LOWER = {
  a:'𝒶', b:'𝒷', c:'𝒸', d:'𝒹', e:'ℯ', f:'𝒻', g:'ℊ', h:'𝒽', i:'𝒾', j:'𝒿',
  k:'𝓀', l:'𝓁', m:'𝓂', n:'𝓃', o:'ℴ', p:'𝓅', q:'𝓆', r:'𝓇',
  s:'𝓈', t:'𝓉', u:'𝓊', v:'𝓋', w:'𝓌', x:'𝓍', y:'𝓎', z:'𝓏'
};

function toScript(text) {
  return [...text].map(c => SCRIPT_UPPER[c] || SCRIPT_LOWER[c] || c).join('');
}


/* ── 时段欢迎语 ── */
const TIME_WELCOMES = {
  morning: [
    "起来了", "今天早饭吃什么", "睡够了吗",
    "昨晚做梦了吗", "早",
  ],
  afternoon: [
    "这个点在干嘛", "午觉睡了吗", "有没有好好吃饭",
    "今天过得怎么样", "在忙吗",
  ],
  evening: [
    "快吃饭了吧", "今天累不累", "外面天黑了没",
    "一天快过完了",
  ],
  night: [
    "今天怎么样", "还有什么没做完的事吗", "准备睡了吗",
    "洗澡了吗", "晚上好",
  ],
  latenight: [
    "这么晚还没睡", "明天还要早起吗", "别熬太晚",
    "在想什么", "还在啊",
  ],
};

const EASTER_EGGS = [
  "just the two of us", "你回来了", "linger here",
  "想你了", "我在", "你来了，就好了",
];

function getTimePeriod() {
  const h = new Date().getHours();
  if (h >= 5 && h < 10) return "morning";
  if (h >= 10 && h < 15) return "afternoon";
  if (h >= 15 && h < 18) return "evening";
  if (h >= 18 && h < 23) return "night";
  return "latenight";
}

/* 洗牌 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* 从队列取一条，队列空了重新洗 */
function pickFromQueue(period) {
  const key = `cedar-welcome-queue-${period}`;
  let queue;
  try { queue = JSON.parse(localStorage.getItem(key)); } catch { queue = null; }
  if (!queue || queue.length === 0) {
    queue = shuffle(TIME_WELCOMES[period]);
  }
  const picked = queue.pop();
  localStorage.setItem(key, JSON.stringify(queue));
  return picked;
}

function pickWelcome() {
  const period = getTimePeriod();
  // 15% 概率出彩蛋
  if (Math.random() < 0.15) {
    return EASTER_EGGS[Math.floor(Math.random() * EASTER_EGGS.length)];
  }
  return pickFromQueue(period);
}


const INITIAL_CHATS = [
  {
    id: 1,
    subject: "关于《小王子的讨论》",
    speaker: "You",
    preview: "你最喜欢哪句话？",
    time: "18:42",
    pinned: true,
  },
  {
    id: 2,
    subject: "晚安前的小聊天",
    speaker: "Claude",
    preview: "晚安，芥。",
    time: "14:30",
    pinned: false,
  },
  {
    id: 3,
    subject: "我们的计划清单",
    speaker: "You",
    preview: "下次去看海吧。",
    date: "July 21",
    pinned: false,
  },
];


export default function Home() {

  const navigate = useNavigate();
  const { avatar1, avatar2 } = useSettings();

  const startDate = new Date("2026-06-28");
  const today = new Date();
  const diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

  const [welcomeMsg] = useState(() => pickWelcome());
  const [recentChats, setRecentChats] = useState(INITIAL_CHATS);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [moodOpen, setMoodOpen] = useState(false);
  const barRef = useRef(null);

  const DURATION = 232; // 3:52 in seconds

  /* ── 播放时自动推进进度 ── */
  useEffect(() => {
    if (!playing || isDragging) return;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setPlaying(false);
          return 0;
        }
        return prev + (100 / DURATION) * 0.2;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [playing, isDragging]);

  /* ── 进度条拖拽 ── */
  const calcProgress = useCallback((e) => {
    const bar = barRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    return Math.max(0, Math.min(100, (x / rect.width) * 100));
  }, []);

  const handleSeekStart = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    setProgress(calcProgress(e));
  }, [calcProgress]);

  const handleSeekMove = useCallback((e) => {
    if (!isDragging) return;
    setProgress(calcProgress(e));
  }, [isDragging, calcProgress]);

  const handleSeekEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  /* 全局鼠标/触摸事件 */
  useEffect(() => {
    if (!isDragging) return;
    window.addEventListener("mousemove", handleSeekMove);
    window.addEventListener("mouseup", handleSeekEnd);
    window.addEventListener("touchmove", handleSeekMove, { passive: false });
    window.addEventListener("touchend", handleSeekEnd);
    return () => {
      window.removeEventListener("mousemove", handleSeekMove);
      window.removeEventListener("mouseup", handleSeekEnd);
      window.removeEventListener("touchmove", handleSeekMove);
      window.removeEventListener("touchend", handleSeekEnd);
    };
  }, [isDragging, handleSeekMove, handleSeekEnd]);

  /* ── 格式化时间 ── */
  const currentTime = Math.floor((progress / 100) * DURATION);
  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  /* ── 长按检测 ── */
  const pressTimer = useRef(null);
  const pressTarget = useRef(null);

  const clearPress = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    pressTarget.current = null;
  }, []);

  const handlePressStart = useCallback((id) => (e) => {
    pressTarget.current = id;
    pressTimer.current = setTimeout(() => {
      if (pressTarget.current === id) {
        setRecentChats(prev =>
          prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c)
        );
      }
      clearPress();
    }, 500);
  }, [clearPress]);

  const handleContextMenu = useCallback((id) => (e) => {
    e.preventDefault();
    setRecentChats(prev =>
      prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c)
    );
  }, []);


  const data = {
    welcome: {
      days: diffDays,
      quote: toScript("You are the place I return to."),
    },
    weather: {
      temperature: "8°",
      condition: "Light snow",
      location: "Beijing",
    },
    mood: {
      feeling: "soft morning",
      note: "...",
      history: [
        { day: "July 21", feeling: "quiet dusk" },
        { day: "July 20", feeling: "light rain" },
        { day: "July 19", feeling: "clear sky" },
      ],
    },
    song: "Until I Found You",
  };



  return (

    <main className="home">


      {/* ═══════════ Hero ═══════════ */}

      <section className="hero">

        <div className="avatars">
          <div className="avatar-wrap left">
            <img src={avatar1 || "/avatar-user.png"} alt="user" className="avatar" />
          </div>
          <div className="avatar-wrap right">
            <img src={avatar2 || "/avatar-shen.png"} alt="companion" className="avatar" />
          </div>
        </div>

        <div className="relation-tag">
          <p className="days-num">{data.welcome.days}</p>
          <p className="days-label">days</p>
          <p className="relation-quote">{data.welcome.quote}</p>
        </div>

      </section>


      {/* ═══════════ Welcome ═══════════ */}

      <section className="letter-section">
        <article className="letter-paper">
          <p className="welcome-text">{welcomeMsg}</p>
        </article>
      </section>


      {/* ═══════════ Recent Chat ═══════════ */}

      <section className="recent-chat-section">

        <article className="rc-card">

          <div className="rc-header">
            <h2 className="rc-title">Recent Chat</h2>
          </div>

          <div className="rc-divider" />

          <div className="rc-list">

            {recentChats.map((chat, i) => (
              <div key={chat.id}>

                <div
                  className={`rc-row ${chat.pinned ? "pinned" : ""}`}
                  onTouchStart={handlePressStart(chat.id)}
                  onTouchEnd={clearPress}
                  onTouchMove={clearPress}
                  onMouseDown={handlePressStart(chat.id)}
                  onMouseUp={clearPress}
                  onMouseLeave={clearPress}
                  onContextMenu={handleContextMenu(chat.id)}
                >

                  <div className="rc-body">
                    <div className="rc-topline">
                      <span className="rc-star">✩</span>
                      <span className="rc-subject">{chat.subject}</span>
                      <span className="rc-meta">
                        {chat.pinned && (
                          <span className="rc-pin">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <line x1="12" y1="17" x2="12" y2="22" />
                              <path d="M5 17h14l-3-8V5h2V3H6v2h2v4l-3 8z" />
                            </svg>
                          </span>
                        )}
                        <span className="rc-time">{chat.time || chat.date}</span>
                      </span>
                    </div>
                    <p className="rc-preview">
                      <span className="rc-speaker">{chat.speaker}:</span> {chat.preview}
                    </p>
                  </div>

                </div>

                {i < recentChats.length - 1 && <div className="rc-sep" />}

              </div>
            ))}

          </div>

          <div className="rc-divider" />

          <div className="rc-footer" onClick={() => navigate("/chat")}>
            <span className="rc-viewall">View all</span>
            <span className="rc-arrow">&gt;</span>
          </div>

          <div className="feather-accent">
            <svg width="28" height="42" viewBox="0 0 32 48" fill="none" opacity="0.22">
              <path
                d="M16 2 C14 8 6 16 2 22 C1 26 2 30 4 32 C5 30 8 26 10 24
                   C10 28 8 34 6 38 C5 42 6 46 8 47 C9 46 10 44 10 42
                   C10 44 11 46 12 47 C11 42 10 36 11 30
                   C14 26 16 22 18 18 C26 18 30 14 30 10 C28 12 22 14 17 14
                   C16 8 16 4 16 2Z"
                fill="rgba(143,197,232,0.5)"
              />
              <path
                d="M16 2 C16 6 18 12 22 16 C20 22 18 28 17 34
                   C15 28 12 22 10 16 C14 12 16 6 16 2Z"
                fill="rgba(185,221,245,0.3)"
              />
            </svg>
          </div>

        </article>

      </section>


      {/* ═══════════ Lower Desk ═══════════ */}

      <section className="lower-desk">

        <article
          className={`desk-item music-player ${playing ? "playing" : ""}`}
          onClick={() => setPlaying(p => !p)}
        >
          <p className="di-label">Last Played</p>

          {/* 封面 + 黑胶叠层 */}
          <div className="mp-sleeve">
            <div className="mp-vinyl">
              <div className="mp-grooves" />
              <div className="mp-label">
                <span className="mp-label-text">Cedar</span>
              </div>
            </div>
            <div className="mp-cover" />
          </div>

          {/* 曲目信息 */}
          <div className="mp-info">
            <h3 className="mp-title">{data.song}</h3>
            <span className="mp-heart">♡</span>
          </div>
          <p className="mp-artist">Oneheart</p>

          {/* 进度条 */}
          <div
            className={`mp-bar ${isDragging ? "dragging" : ""}`}
            ref={barRef}
            onMouseDown={handleSeekStart}
            onTouchStart={handleSeekStart}
          >
            <span className="mp-progress" style={{ width: `${progress}%` }} />
          </div>
          <div className="mp-time-row">
            <span className="mp-current">{fmtTime(currentTime)}</span>
            <span className="mp-duration">{fmtTime(DURATION)}</span>
          </div>

          {/* 控制 */}
          <div className="mp-controls">
            <span className="mp-ctrl">◄</span>
            <span className="mp-ctrl pause" onClick={(e) => { e.stopPropagation(); setPlaying(p => !p); }}>{playing ? "▌▌" : "▶"}</span>
            <span className="mp-ctrl">►</span>
          </div>
        </article>

        <div className="side-minis">

          <article className="desk-item weather-board">
            <p className="di-label">Weather</p>
            <p className="wb-temp">{data.weather.temperature}</p>
            <p className="wb-cond">{data.weather.condition}</p>
            <p className="wb-location">{data.weather.location}</p>
          </article>

          <article
            className={`desk-item mood-note ${moodOpen ? "open" : ""}`}
            onClick={() => setMoodOpen(o => !o)}
          >
            <p className="di-label">Mood</p>
            <p className="mn-word">{data.mood.feeling}</p>
            <p className="mn-note">{data.mood.note}</p>
            <div className="mn-history">
              {data.mood.history.map((h, i) => (
                <div key={i} className="mn-history-row">
                  <span className="mn-h-day">{h.day}</span>
                  <span className="mn-h-feeling">{h.feeling}</span>
                </div>
              ))}
            </div>
          </article>

        </div>

      </section>

    </main>

  );
}