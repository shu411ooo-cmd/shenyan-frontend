import { createContext, useContext, useState, useCallback } from 'react';

const SettingsContext = createContext(null);

const fileToDataUrl = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => resolve(ev.target.result);
    reader.readAsDataURL(file);
  });

export function SettingsProvider({ children }) {
  // ── 外观 ──
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('cedar-theme') || 'winter-cedar');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('cedar-dark') === 'true');
  const [currentFont, setCurrentFont] = useState(() => localStorage.getItem('cedar-font') || 'System');
  const [textSize, setTextSize] = useState(() => localStorage.getItem('cedar-textsize') || 'Default');
  const [language, setLanguage] = useState(() => localStorage.getItem('cedar-lang') || '中文');

  // ── 背景 ──
  const [bgImage, setBgImage] = useState(() => localStorage.getItem('cedar-bg-image') || null);
  const [mistLevel, setMistLevel] = useState(() => Number(localStorage.getItem('cedar-mist-level')) || 45);

  // ── Mind ──
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('cedar-model') || 'Claude Sonnet 4.6');
  const [thinkingDepth, setThinkingDepth] = useState(() => localStorage.getItem('cedar-depth') || 'Balanced');
  const [respondInstruction, setRespondInstruction] = useState(() => localStorage.getItem('cedar-respond') || "Speak to me like we've known each other forever...");

  // ── API ──
  const [apiProvider, setApiProvider] = useState(() => localStorage.getItem('cedar-provider') || 'Anthropic');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('cedar-apikey') || '••••••••••••');

  // ── Profile ──
  const [avatar1, setAvatar1] = useState(() => localStorage.getItem('cedar-avatar1') || null);
  const [avatar2, setAvatar2] = useState(() => localStorage.getItem('cedar-avatar2') || null);
  const [name1, setName1] = useState(() => localStorage.getItem('cedar-name1') || '小芥');
  const [sub1, setSub1] = useState(() => localStorage.getItem('cedar-sub1') || 'You');
  const [name2, setName2] = useState(() => localStorage.getItem('cedar-name2') || '哥哥');
  const [sub2, setSub2] = useState(() => localStorage.getItem('cedar-sub2') || 'Shen Yan');

  // ── 持久化 helpers ──
  const setAndSave = useCallback((setFn, key, transform = (v) => v) => (val) => {
    const v = typeof val === 'function' ? undefined : val; // handle both direct and callback
    // We support both value and setState callback
    if (typeof val === 'function') {
      setFn((prev) => {
        const next = val(prev);
        localStorage.setItem(key, transform(next));
        return next;
      });
    } else {
      setFn(val);
      localStorage.setItem(key, transform(val));
    }
  }, []);

  // ── 背景图上传/移除 ──
  const handleBgUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setBgImage(dataUrl);
    localStorage.setItem('cedar-bg-image', dataUrl);
  }, []);

  const handleRemoveBg = useCallback(() => {
    setBgImage(null);
    localStorage.removeItem('cedar-bg-image');
  }, []);

  // ── 头像上传/移除 ──
  const handleAvatarUpload = useCallback((setFn, key) => async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setFn(dataUrl);
    localStorage.setItem(key, dataUrl);
  }, []);

  const handleAvatarRemove = useCallback((setFn, key) => () => {
    setFn(null);
    localStorage.removeItem(key);
  }, []);

  const value = {
    // 外观
    currentTheme, setCurrentTheme: (v) => { setCurrentTheme(v); localStorage.setItem('cedar-theme', v); },
    isDarkMode, setIsDarkMode: (v) => { setIsDarkMode(v); localStorage.setItem('cedar-dark', v); },
    currentFont, setCurrentFont: (v) => { setCurrentFont(v); localStorage.setItem('cedar-font', v); },
    textSize, setTextSize: (v) => { setTextSize(v); localStorage.setItem('cedar-textsize', v); },
    language, setLanguage: (v) => { setLanguage(v); localStorage.setItem('cedar-lang', v); },
    // 背景
    bgImage, handleBgUpload, handleRemoveBg,
    mistLevel, setMistLevel: (v) => { setMistLevel(v); localStorage.setItem('cedar-mist-level', v); },
    // Mind
    selectedModel, setSelectedModel: (v) => { setSelectedModel(v); localStorage.setItem('cedar-model', v); },
    thinkingDepth, setThinkingDepth: (v) => { setThinkingDepth(v); localStorage.setItem('cedar-depth', v); },
    respondInstruction, setRespondInstruction: (v) => { setRespondInstruction(v); localStorage.setItem('cedar-respond', v); },
    // API
    apiProvider, setApiProvider: (v) => { setApiProvider(v); localStorage.setItem('cedar-provider', v); },
    apiKey, setApiKey: (v) => { setApiKey(v); localStorage.setItem('cedar-apikey', v); },
    // Profile
    avatar1, setAvatar1, handleAvatarUpload, handleAvatarRemove,
    avatar2, setAvatar2,
    name1, setName1: (v) => { setName1(v); localStorage.setItem('cedar-name1', v); },
    sub1, setSub1: (v) => { setSub1(v); localStorage.setItem('cedar-sub1', v); },
    name2, setName2: (v) => { setName2(v); localStorage.setItem('cedar-name2', v); },
    sub2, setSub2: (v) => { setSub2(v); localStorage.setItem('cedar-sub2', v); },
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be inside SettingsProvider');
  return ctx;
}
