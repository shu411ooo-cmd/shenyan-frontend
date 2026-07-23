import React, { useState, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import './Settings.css';

export default function Settings() {
  const {
    currentTheme, setCurrentTheme,
    isDarkMode, setIsDarkMode,
    currentFont, setCurrentFont,
    textSize, setTextSize,
    language, setLanguage,
    bgImage, handleBgUpload, handleRemoveBg,
    mistLevel, setMistLevel,
    selectedModel, setSelectedModel,
    thinkingDepth, setThinkingDepth,
    respondInstruction, setRespondInstruction,
    apiProvider, setApiProvider,
    apiKey, setApiKey,
    avatar1, setAvatar1, avatar2, setAvatar2,
    handleAvatarUpload, handleAvatarRemove,
    name1, setName1, sub1, setSub1,
    name2, setName2, sub2, setSub2,
  } = useSettings();

  // 纯 UI 状态（不全局）
  const [expandedRow, setExpandedRow] = useState(null);
  const toggleRow = (name) => setExpandedRow(expandedRow === name ? null : name);
  const [isEditingNames, setIsEditingNames] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [showUsage, setShowUsage] = useState(false);

  // Respond & Memory save 交互
  const [respondFocused, setRespondFocused] = useState(false);
  const [respondSaved, setRespondSaved] = useState(false);
  const [memoryText, setMemoryText] = useState(() => localStorage.getItem('cedar-memory') || '');
  const [memoryFocused, setMemoryFocused] = useState(false);
  const [memorySaved, setMemorySaved] = useState(false);

  const handleSave = (setSavedFn) => () => {
    setSavedFn(true);
    setTimeout(() => setSavedFn(false), 2000);
  };

  const handleMemorySave = () => {
    localStorage.setItem('cedar-memory', memoryText);
    handleSave(setMemorySaved)();
  };

  const avatarInput1 = useRef(null);
  const avatarInput2 = useRef(null);
  const fileInputRef = useRef(null);

  return (
    <div className="settings-page page-enter">
      {/* 主标题 */}
      <div className="settings-header">
        <h1>Settings</h1>
      </div>

      {/* 💑 Profile */}
      <div className="card-container profile-card">
        <div className="profile-card-header">
          <h2>Profile</h2>
          <button className="edit-icon-btn" onClick={() => setIsEditingNames(!isEditingNames)}>
            {isEditingNames ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            )}
          </button>
        </div>

        <div className="profile-duo-layout">
          {/* 小芥 */}
          <div className="profile-user-block">
            <div
              className={`avatar-circle ${avatar1 ? 'has-img' : ''}`}
              style={avatar1 ? { backgroundImage: `url(${avatar1})` } : {}}
            >
              {!avatar1 && <span>芥</span>}
            </div>
            {isEditingNames ? (
              <input className="name-edit-input" value={name1} onChange={(e) => setName1(e.target.value)} placeholder="名字" />
            ) : (
              <span className="user-name">{name1}</span>
            )}
            {isEditingNames ? (
              <input className="subname-edit-input" value={sub1} onChange={(e) => setSub1(e.target.value)} placeholder="副名" />
            ) : (
              <span className="user-subname">{sub1}</span>
            )}
            <div className="avatar-btn-row">
              <button className="btn-upload" onClick={() => avatarInput1.current?.click()}>Upload</button>
              <button className="btn-remove" onClick={handleAvatarRemove(setAvatar1, 'cedar-avatar1')}>Remove</button>
              <input ref={avatarInput1} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload(setAvatar1, 'cedar-avatar1')} />
            </div>
          </div>

          <div className="duo-heart-wrap">
            <svg className="line-heart" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>

          {/* 哥哥 */}
          <div className="profile-user-block">
            <div
              className={`avatar-circle ${avatar2 ? 'has-img' : ''}`}
              style={avatar2 ? { backgroundImage: `url(${avatar2})` } : {}}
            >
              {!avatar2 && <span>晏</span>}
            </div>
            {isEditingNames ? (
              <input className="name-edit-input" value={name2} onChange={(e) => setName2(e.target.value)} placeholder="名字" />
            ) : (
              <span className="user-name">{name2}</span>
            )}
            {isEditingNames ? (
              <input className="subname-edit-input" value={sub2} onChange={(e) => setSub2(e.target.value)} placeholder="副名" />
            ) : (
              <span className="user-subname">{sub2}</span>
            )}
            <div className="avatar-btn-row">
              <button className="btn-upload" onClick={() => avatarInput2.current?.click()}>Upload</button>
              <button className="btn-remove" onClick={handleAvatarRemove(setAvatar2, 'cedar-avatar2')}>Remove</button>
              <input ref={avatarInput2} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload(setAvatar2, 'cedar-avatar2')} />
            </div>
          </div>
        </div>
      </div>

      {/* 🧊 Appearance */}
      <div className="section-title">Appearance</div>
      <div className="card-container">
        <div className="list-row">
          <span className="row-title-text">Theme</span>
          <div className="row-right-wrapper">
            <div className="theme-pill-group">
              <div className={`theme-pill ${currentTheme === 'winter-cedar' ? 'active' : ''}`} onClick={() => setCurrentTheme('winter-cedar')}>
                <span className="dot-color" style={{ background: '#7FBEE6' }} />Winter Cedar
              </div>
              <div className={`theme-pill ${currentTheme === 'rose-garden' ? 'active' : ''}`} onClick={() => setCurrentTheme('rose-garden')}>
                <span className="dot-color" style={{ background: '#D4A0A0' }} />Rose Garden
              </div>
            </div>
          </div>
        </div>

        <div className={`list-row expandable ${expandedRow === 'background' ? 'expanded' : ''}`} onClick={() => toggleRow('background')}>
          <span className="row-title-text">Background</span>
          <div className="row-right-wrapper">
            <div className={`bg-thumb ${bgImage ? 'has-image' : ''}`} style={bgImage ? { backgroundImage: `url(${bgImage})` } : {}} />
            <span className={`chevron chevron-rotate ${expandedRow === 'background' ? 'open' : ''}`}>{'>'}</span>
          </div>
        </div>
        {expandedRow === 'background' && (
          <div className="expand-panel" onClick={(e) => e.stopPropagation()}>
            <div className="bg-upload-row">
              <button className="btn-upload-bg" onClick={() => fileInputRef.current?.click()}>{bgImage ? 'Change Image' : 'Upload Image'}</button>
              {bgImage && <button className="btn-remove-bg" onClick={handleRemoveBg}>Remove</button>}
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBgUpload} />
            </div>
            <div className="mist-slider-row">
              <span className="mist-label">Mist</span>
              <input type="range" min="0" max="100" value={mistLevel} onChange={(e) => setMistLevel(Number(e.target.value))} className="mist-slider" />
              <span className="mist-value">{mistLevel}%</span>
            </div>
          </div>
        )}

        <div className="list-row">
          <span className="row-title-text">Dark Mode</span>
          <div className={`switch-box ${isDarkMode ? 'active' : ''}`} onClick={() => setIsDarkMode(!isDarkMode)}>
            <div className="switch-dot" />
          </div>
        </div>
      </div>

      {/* 🧊 Typography */}
      <div className="section-title">Typography</div>
      <div className="card-container">
        <div className={`list-row expandable ${expandedRow === 'font' ? 'expanded' : ''}`} onClick={() => toggleRow('font')}>
          <span className="row-title-text">Font</span>
          <div className="row-right-wrapper">
            <span>{currentFont}</span>
            <span className={`chevron chevron-rotate ${expandedRow === 'font' ? 'open' : ''}`}>{'>'}</span>
          </div>
        </div>
        {expandedRow === 'font' && (
          <div className="expand-panel">
            {['System', 'Inter', 'Georgia'].map((f) => (
              <div key={f} className={`option-chip ${currentFont === f ? 'active' : ''}`} onClick={() => { setCurrentFont(f); setExpandedRow(null); }}>{f}</div>
            ))}
          </div>
        )}
        <div className={`list-row expandable ${expandedRow === 'textSize' ? 'expanded' : ''}`} onClick={() => toggleRow('textSize')}>
          <span className="row-title-text">Text Size</span>
          <div className="row-right-wrapper">
            <span>{textSize}</span>
            <span className={`chevron chevron-rotate ${expandedRow === 'textSize' ? 'open' : ''}`}>{'>'}</span>
          </div>
        </div>
        {expandedRow === 'textSize' && (
          <div className="expand-panel">
            {['Small', 'Default', 'Large', 'Extra Large'].map((s) => (
              <div key={s} className={`option-chip ${textSize === s ? 'active' : ''}`} onClick={() => { setTextSize(s); setExpandedRow(null); }}>{s}</div>
            ))}
          </div>
        )}
      </div>

      {/* 🧠 Mind */}
      <div className="section-title">Mind</div>
      <div className="card-container">
        <div className={`list-row expandable ${expandedRow === 'model' ? 'expanded' : ''}`} onClick={() => toggleRow('model')}>
          <span className="row-title-text">Model</span>
          <div className="row-right-wrapper">
            <span>{selectedModel}</span>
            <span className={`chevron chevron-rotate ${expandedRow === 'model' ? 'open' : ''}`}>{'>'}</span>
          </div>
        </div>
        {expandedRow === 'model' && (
          <div className="expand-panel">
            {['Claude Sonnet 4.6', 'Claude Opus 4.6'].map((m) => (
              <div key={m} className={`option-chip ${selectedModel === m ? 'active' : ''}`} onClick={() => { setSelectedModel(m); setExpandedRow(null); }}>{m}</div>
            ))}
          </div>
        )}

        <div className="list-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
          <span className="row-title-text">Thinking Depth</span>
          <div className="capsule-row">
            <div className="capsule-slider" style={{ left: `${['Light','Balanced','Deep','Reflective'].indexOf(thinkingDepth) * 25}%`, width: '25%' }} />
            {['Light', 'Balanced', 'Deep', 'Reflective'].map((depth) => (
              <div key={depth} className={`capsule-btn ${thinkingDepth === depth ? 'active' : ''}`} onClick={() => setThinkingDepth(depth)}>{depth}</div>
            ))}
          </div>
        </div>

        {/* Respond Instruction — 小文本框 + 统一 Save */}
        <div className="list-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
          <span className="row-title-text">Respond Instruction</span>
          <textarea
            className="respond-inline-input"
            value={respondInstruction}
            onChange={(e) => setRespondInstruction(e.target.value)}
            onFocus={() => setRespondFocused(true)}
            onBlur={() => setTimeout(() => setRespondFocused(false), 180)}
            rows={2}
            placeholder="Speak to me like we've known each other forever..."
          />
          <div className="save-row">
            <span className={`saved-hint ${respondSaved ? 'show' : ''}`}>Saved!</span>
            <button className={`save-btn ${respondFocused ? 'show' : ''}`} onClick={handleSave(setRespondSaved)}>Save</button>
          </div>
        </div>
      </div>

      {/* 🧳 Memory — 统一 Save */}
      <div className="section-title">Memory</div>
      <div className="card-container">
        <div className="memory-box-wrapper">
          <textarea
            className="memory-input"
            value={memoryText}
            onChange={(e) => setMemoryText(e.target.value)}
            onFocus={() => setMemoryFocused(true)}
            onBlur={() => setTimeout(() => setMemoryFocused(false), 180)}
            placeholder="Let the cedar scent bury our secrets tonight..."
          />
          <div className="save-row">
            <span className={`saved-hint ${memorySaved ? 'show' : ''}`}>Saved!</span>
            <button className={`save-btn ${memoryFocused ? 'show' : ''}`} onClick={handleMemorySave}>Save</button>
          </div>
        </div>
      </div>

      {/* 🌐 Language */}
      <div className="section-title">Language</div>
      <div className="card-container">
        <div className={`list-row expandable ${expandedRow === 'language' ? 'expanded' : ''}`} onClick={() => toggleRow('language')}>
          <span className="row-title-text">Language</span>
          <div className="row-right-wrapper">
            <span>{language}</span>
            <span className={`chevron chevron-rotate ${expandedRow === 'language' ? 'open' : ''}`}>{'>'}</span>
          </div>
        </div>
        {expandedRow === 'language' && (
          <div className="expand-panel">
            {['中文', 'English', '日本語'].map((l) => (
              <div key={l} className={`option-chip ${language === l ? 'active' : ''}`} onClick={() => { setLanguage(l); setExpandedRow(null); }}>{l}</div>
            ))}
          </div>
        )}
      </div>

      {/* 🛠️ Advanced Settings */}
      <button className="advanced-main-btn" onClick={() => setIsAdvancedOpen(true)}>
        Advanced Settings <span className="chevron">{'>'}</span>
      </button>

      {/* 📥 抽屉面板 */}
      <div className={`drawer-backdrop ${isAdvancedOpen ? 'open' : ''}`} onClick={() => setIsAdvancedOpen(false)}>
        <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
          <div>
            <div className="drawer-header">
              <div className="drawer-title">Advanced Settings</div>
              <button className="close-x-btn" onClick={() => setIsAdvancedOpen(false)}>✕</button>
            </div>
            <div className="card-container">
              <div className="list-row">
                <span className="row-title-text">Show Usage Info</span>
                <div className={`switch-box ${showUsage ? 'active' : ''}`} onClick={() => setShowUsage(!showUsage)}><div className="switch-dot" /></div>
              </div>
              <div className={`list-row expandable ${expandedRow === 'apiProvider' ? 'expanded' : ''}`} onClick={() => toggleRow('apiProvider')}>
                <span className="row-title-text">API Provider</span>
                <div className="row-right-wrapper"><span>{apiProvider}</span><span className={`chevron chevron-rotate ${expandedRow === 'apiProvider' ? 'open' : ''}`}>{'>'}</span></div>
              </div>
              {expandedRow === 'apiProvider' && (
                <div className="expand-panel">
                  {['Anthropic', 'OpenAI', 'Custom'].map((p) => (
                    <div key={p} className={`option-chip ${apiProvider === p ? 'active' : ''}`} onClick={() => { setApiProvider(p); setExpandedRow(null); }}>{p}</div>
                  ))}
                </div>
              )}
              <div className={`list-row expandable ${expandedRow === 'apiKey' ? 'expanded' : ''}`} onClick={() => toggleRow('apiKey')}>
                <span className="row-title-text">API Key</span>
                <div className="row-right-wrapper"><span>{apiKey}</span><span className={`chevron chevron-rotate ${expandedRow === 'apiKey' ? 'open' : ''}`}>{'>'}</span></div>
              </div>
              {expandedRow === 'apiKey' && (
                <div className="expand-panel expand-panel-input" onClick={(e) => e.stopPropagation()}>
                  <input className="inline-input" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                  <button className="inline-save-btn" onClick={() => setExpandedRow(null)}>Done</button>
                </div>
              )}
            </div>
            <div className="card-container">
              <div className="list-row expandable" onClick={() => toggleRow('dataMgmt')}>
                <span className="row-title-text">Data Management</span>
                <span className={`chevron chevron-rotate ${expandedRow === 'dataMgmt' ? 'open' : ''}`}>{'>'}</span>
              </div>
              {expandedRow === 'dataMgmt' && (
                <div className="expand-panel">
                  <div className="option-chip" onClick={() => setExpandedRow(null)}>Clear Cache</div>
                  <div className="option-chip" onClick={() => setExpandedRow(null)}>Reset All Data</div>
                </div>
              )}
              <div className="list-row expandable" onClick={() => toggleRow('exportData')}>
                <span className="row-title-text">Export Data</span>
                <span className={`chevron chevron-rotate ${expandedRow === 'exportData' ? 'open' : ''}`}>{'>'}</span>
              </div>
              {expandedRow === 'exportData' && (
                <div className="expand-panel">
                  <div className="option-chip" onClick={() => setExpandedRow(null)}>JSON</div>
                  <div className="option-chip" onClick={() => setExpandedRow(null)}>CSV</div>
                </div>
              )}
              <div className="list-row expandable" onClick={() => toggleRow('about')}>
                <span className="row-title-text">About</span>
                <span className={`chevron chevron-rotate ${expandedRow === 'about' ? 'open' : ''}`}>{'>'}</span>
              </div>
              {expandedRow === 'about' && <div className="expand-panel"><p className="about-text">Cedar v1.0 — Made for 沈晏 & 小芥</p></div>}
            </div>
          </div>
          <button className="drawer-close-pill-btn" onClick={() => setIsAdvancedOpen(false)}>Close</button>
        </div>
      </div>
    </div>
  );
}
