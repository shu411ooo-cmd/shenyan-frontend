import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import ChatSearch from "./pages/ChatSearch";
import ChatBookmarks from "./pages/ChatBookmarks";
import Settings from "./pages/Settings";
import Moments from "./pages/Moments";
import BottomNav from "./components/BottomNav";
import "./App.css";

function AppShell({ children }) {
  const { currentTheme, bgImage, mistLevel } = useSettings();

  return (
    <div className={`app-shell theme-${currentTheme}`}>
      {/* 全局背景图层 */}
      {bgImage && (
        <div className="global-bg-image" style={{ backgroundImage: `url(${bgImage})` }} />
      )}
      <div className="global-mist-layer" style={{ opacity: mistLevel / 100 }} />

      {/* 全局字体 & 字号 */}
      <FontApply />

      <div className="app-content">
        {children}
      </div>
    </div>
  );
}

function FontApply() {
  const { currentFont, textSize } = useSettings();

  const fontMap = {
    'System': "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', 'Helvetica Neue', sans-serif",
    'Inter': "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    'Georgia': "'Georgia', 'Times New Roman', 'Cormorant Garamond', serif",
  };

  const sizeMap = {
    'Small': '14px',
    'Default': '16px',
    'Large': '18px',
    'Extra Large': '20px',
  };

  const font = fontMap[currentFont] || fontMap['DM Sans'];
  const size = sizeMap[textSize] || sizeMap['Default'];

  document.documentElement.style.setProperty('--app-font', font);
  document.documentElement.style.setProperty('--app-font-size', size);

  return null;
}

function AppContent() {
  const location = useLocation();
  const hideNav = location.pathname.startsWith("/chat");

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/search" element={<ChatSearch />} />
        <Route path="/chat/bookmarks" element={<ChatBookmarks />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/moments" element={<Moments />} />
      </Routes>
      {!hideNav && <BottomNav />}
    </AppShell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </BrowserRouter>
  );
}
