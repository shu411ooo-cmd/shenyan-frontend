import { useState, useMemo, useEffect, useRef } from 'react';
import './Moments.css';

const MOODS = [
  { key: 'calm',       color: '#92A8D1', label: 'calm' },
  { key: 'sweet',      color: '#F7CAC9', label: 'sweet' },
  { key: 'relax',      color: '#B5D6C0', label: 'relax' },
  { key: 'warm',       color: '#FFE6A5', label: 'warm' },
  { key: 'reflective', color: '#D1C4E9', label: 'reflective' },
  { key: 'tired',      color: '#B0BEC5', label: 'tired' },
];

const MEMORIES = [];

const WHISPER_COLORS = ['pearl','mist','sage','blush','lavender','cream','silver','seafoam'];

const WHISPERS = [].map(w => ({ ...w, color: WHISPER_COLORS[Math.floor(Math.random() * WHISPER_COLORS.length)] }));

const KEEPSAKES = [
  { title: '黄昏的天台', date: 'July 21' },
  { title: '我们在娄底散步', date: 'our walk' },
  { title: '第一次看的日落', date: 'sunset' },
];

function makeRainCurtain() {
  const threads = [];
  MEMORIES.forEach((mem, i) => {
    threads.push({
      id: mem.id, kind: 'memory', data: mem,
      left: 10 + i * 30 + (i === 1 ? 10 : i === 2 ? -5 : 0),
      len: 110 + i * 35, sway: 3.5 + i * 1.2, delay: i * 0.8, opacity: 0.7,
    });
  });
  const rainSeeds = [
    { left: 20, len: 90,  sway: 4.5, delay: 0.3 },
    { left: 40, len: 130, sway: 3.8, delay: 1.6 },
    { left: 45, len: 155, sway: 3.2, delay: 1.2, deep: true },
    { left: 58, len: 75,  sway: 5.0, delay: 2.2 },
    { left: 55, len: 160, sway: 3.0, delay: 0.7, deep: true },
    { left: 75, len: 120, sway: 4.2, delay: 0.9 },
    { left: 85, len: 95,  sway: 4.7, delay: 2.6 },
    { left: 5,  len: 110, sway: 3.5, delay: 1.1 },
    { left: 50, len: 85,  sway: 4.0, delay: 3.0 },
  ];
  rainSeeds.forEach((s, i) => {
    threads.push({
      id: `rain-${i}`, kind: 'rain', data: null,
      left: s.left, len: s.len, sway: s.sway, delay: s.delay,
      opacity: s.deep ? 0.38 : (0.22 + Math.random() * 0.16),
      deep: s.deep || false,
    });
  });
  return threads;
}

function getMonthData(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrent = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();
  const weeks = [];
  let week = Array(7).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const col = (firstDay + d - 1) % 7;
    week[col] = {
      day: d,
      isToday: isCurrent && d === todayDate,
      hasMemory: MEMORIES.some((m) => {
        const md = new Date(m.date);
        return md.getFullYear() === year && md.getMonth() === month && md.getDate() === d;
      }),
    };
    if (col === 6 || d === daysInMonth) { weeks.push([...week]); week = Array(7).fill(null); }
  }
  return { weeks, monthLabel: new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) };
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Moments() {
  /* ── 日历 ── */
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(6);
  const [selectedDate, setSelectedDate] = useState(null);
  const [mood, setMood] = useState('calm');
  const [dayNote, setDayNote] = useState('');

  const [savedMoods, setSavedMoods] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cedar-day-moods') || '{}'); }
    catch { return {}; }
  });

  /* ── sticky 胶囊 ── */
  const [showPill, setShowPill] = useState(false);
  const calendarRef = useRef(null);
  const today = new Date();

  useEffect(() => {
    const el = calendarRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setShowPill(!e.isIntersecting),
      { threshold: 0, rootMargin: '-40px 0px 0px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const threads = useMemo(() => makeRainCurtain(), []);
  const { weeks, monthLabel } = getMonthData(calYear, calMonth);

  const [activeDrop, setActiveDrop] = useState(null);
  const [whisperIdx, setWhisperIdx] = useState(0);
  const whisperRef = useRef(null);
  const onWhisperScroll = () => {
    const el = whisperRef.current; if (!el) return;
    setWhisperIdx(Math.round(el.scrollLeft / el.clientWidth));
  };
  const activeMemory = activeDrop && threads.find((t) => t.id === activeDrop && t.kind === 'memory');

  /* ── Keepsake ── */
  const [timeline, setTimeline] = useState(false);
  const keepRef = useRef(null);

  const handleDateClick = (cell) => {
    if (!cell) return;
    const key = `${calYear}-${calMonth}-${cell.day}`;
    if (selectedDate && selectedDate.key === key) {
      setSelectedDate(null);
    } else {
      setSelectedDate({ year: calYear, month: calMonth, day: cell.day, key });
      setMood(savedMoods[key] || 'calm');
      setDayNote('');
    }
  };

  const handleDaySave = () => {
    if (!selectedDate) return;
    const key = selectedDate.key;
    const updated = { ...savedMoods, [key]: mood };
    setSavedMoods(updated);
    localStorage.setItem('cedar-day-moods', JSON.stringify(updated));
    setSelectedDate(null);
  };

  return (
    <div className="moments-page page-enter">

      {/* 📅 Sticky 胶囊 */}
      <div className={`sticky-pill ${showPill ? 'show' : ''}`}>
        <span className="pill-date">{today.getMonth() + 1}/{today.getDate()}</span>
        <span className="pill-divider">·</span>
        <span className="pill-day">{WEEKDAYS[today.getDay()]}</span>
      </div>

      <div className="moments-inner">
        {/* 主标题 */}
        <div className="moments-header">
          <h1>Moments</h1>
          <p className="moments-sub">a dream window of time</p>
        </div>

        {/* 📅 完整日历 */}
        <div className="calendar-frame" ref={calendarRef}>
          <div className="cal-nav">
            <button className="cal-arrow" onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <span className="cal-month-label">{monthLabel}</span>
            <button className="cal-arrow" onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
          <div className="cal-weekdays">
            {['S','M','T','W','T','F','S'].map((d,i) => <span key={i}>{d}</span>)}
          </div>
          <div className="cal-grid">
            {weeks.map((week, wi) => (
              <div key={wi} className="cal-week">
                {week.map((cell, ci) => {
                  const dateKey = cell ? `${calYear}-${calMonth}-${cell.day}` : '';
                  const savedMood = dateKey && savedMoods[dateKey];
                  const moodColor = savedMood ? MOODS.find((m) => m.key === savedMood)?.color : null;
                  return (
                    <span
                      key={ci}
                      className={`cal-cell ${cell ? (cell.isToday ? 'today' : '') + (cell.hasMemory ? ' has-mem' : '') + (savedMood ? ' has-mood' : '') : 'empty'}`}
                      style={moodColor ? { '--mood-bg': moodColor } : {}}
                      onClick={() => handleDateClick(cell)}
                    >
                      {cell ? cell.day : ''}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
          {selectedDate && (
            <div className="day-record">
              <div className="record-top">
                <span className="record-date">{selectedDate.year}.{String(selectedDate.month + 1).padStart(2, '0')}.{String(selectedDate.day).padStart(2, '0')}</span>
                <button className="record-close" onClick={() => setSelectedDate(null)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="record-moods">
                {MOODS.map((m) => (
                  <span key={m.key} className={`mood-dot ${mood === m.key ? 'active' : ''}`}
                    style={{ '--dot-color': m.color }} onClick={() => setMood(m.key)} title={m.label} />
                ))}
                <span className="mood-label">{MOODS.find((m) => m.key === mood)?.label}</span>
              </div>
              <div className="record-note-box">
                <textarea className="record-input" value={dayNote} onChange={(e) => setDayNote(e.target.value)}
                  placeholder="what stays with you today…" rows={3} />
                <div className="record-save-row">
                  <button className="record-save-btn" onClick={handleDaySave}>Save</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 💧 dear yesterday */}
        <div className="section-block">
          <h2 className="section-title">Dear yesterday</h2>
          <p className="section-sub cursive">𝒮𝑜𝓂𝑒 𝒹𝒶𝓎𝓈 𝓈𝓉𝒾𝓁𝓁 𝒷𝓁𝑜𝑜𝓂 𝒾𝓃 𝓂𝑒𝓂𝑜𝓇𝓎.</p>
          <div className="rain-space">
            {threads.map((t) => (
              <div key={t.id} className={`thread-column ${t.kind === 'memory' ? 'is-memory' : ''} ${t.deep ? 'deep' : ''}`}
                style={{ left: `${t.left}%`, '--sway-dur': `${t.sway}s`, '--sway-delay': `${t.delay}s` }}
                onClick={() => setActiveDrop(activeDrop === t.id ? null : t.id)}>
                <div className="thread-line" style={{ height: t.len, opacity: t.opacity }} />
                <div className={`thread-drop ${activeDrop === t.id ? 'active' : ''}`}>
                  <div className={`drop-ripple ${activeDrop === t.id ? 'active' : ''}`} />
                  <div className="drop-tear" style={{ opacity: t.opacity + 0.08 }}>
                    <div className="drop-shine" />
                  </div>
                </div>
              </div>
            ))}
            {activeMemory && (
              <div className="time-fragment">
                <div className="fragment-glow" />
                <div className="fragment-card">
                  <span className="fragment-date">{activeMemory.data.date}</span>
                  <span className="fragment-text">{activeMemory.data.text}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 📷 Keepsake */}
        <div className="section-card">
          <div className="keepsake-header">
            <h2 className="section-title">Keepsake</h2>
            <div className="keepsake-actions">
              <button className="keepsake-toggle" onClick={() => setTimeline(!timeline)} title={timeline ? 'polaroid' : 'timeline'}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {timeline
                    ? <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>
                    : <><line x1="12" y1="3" x2="12" y2="21" /><circle cx="12" cy="7" r="2" /><circle cx="12" cy="17" r="2" /></>
                  }
                </svg>
              </button>
              <button className="keepsake-add" onClick={() => keepRef.current?.click()}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <input ref={keepRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={() => {}} />
            </div>
          </div>

          {timeline ? (
            <div className="keepsake-timeline">
              <div className="kt-line" />
              {KEEPSAKES.map((k, i) => (
                <div key={i} className="kt-item">
                  <div className="kt-dot" />
                  <div className="kt-card">
                    <div className="kt-img" />
                    <span className="kt-text">{k.title} · {k.date}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="polaroid-wall">
              {KEEPSAKES.map((k, i) => (
                <div key={i} className={`polaroid p${i + 1}`}>
                  <div className="polaroid-img" />
                  <div className="polaroid-caption">{k.date}</div>
                  {i === 2 ? <div className="paperclip tilt" /> : i === 1 ? <div className="pushpin" /> : <div className="paperclip" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 💬 Yan's whisper */}
        <div className="whisper-section">
          <h2 className="section-title">Yan's whisper</h2>
          <div className="whisper-scroll" ref={whisperRef} onScroll={onWhisperScroll}>
            {WHISPERS.map((w, i) => (
              <div key={i} className="whisper-card" data-color={w.color}>
                <span className="stamp-no">No.{String(w.no).padStart(2, '0')}</span>
                <p className="whisper-text">{w.text}</p>
                <div className="stamp-mark">
                  <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                    <circle cx="19" cy="19" r="16" stroke="#9E7777" strokeWidth="0.7" strokeDasharray="3 2" opacity="0.45" />
                    <circle cx="19" cy="19" r="13" stroke="#9E7777" strokeWidth="0.5" opacity="0.3" />
                    <text x="19" y="16" textAnchor="middle" fill="#9E7777" opacity="0.55" fontSize="6" fontFamily="Times New Roman, serif">POSTAL</text>
                    <text x="19" y="24" textAnchor="middle" fill="#9E7777" opacity="0.45" fontSize="5" fontFamily="Times New Roman, serif">{w.date}</text>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
