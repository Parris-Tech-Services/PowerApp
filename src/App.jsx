import React, { useState, useEffect } from "react";
import { themes, getStyles } from "./constants";
import { Icon } from "./components/Icon";
import LearnTab from "./components/LearnTab";
import ConnectTab from "./components/ConnectTab";
import InspireTab from "./components/InspireTab";
import PrepareTab from "./components/PrepareTab";
import SessionTab from "./components/SessionTab";
import ReflectTab from "./components/ReflectTab";
import ResourceDirectory from "./components/ResourceDirectory";
import PrivacyTab from "./components/PrivacyTab";
import MoreTab from "./components/MoreTab";
import CovenantTab from "./components/CovenantTab";
import Onboarding from "./components/Onboarding";
import FlowProgress from "./components/FlowProgress";
import { clearAllLocal, getLocal, setLocal } from "./utils/storage";

const tabs = [
  { id: "learn", label: "Learn", icon: "learn", component: LearnTab },
  { id: "connect", label: "Connect", icon: "connect", component: ConnectTab },
  { id: "inspire", label: "Inspire", icon: "inspire", component: InspireTab },
  { id: "prepare", label: "Prepare", icon: "prepare", component: PrepareTab },
  { id: "session", label: "Session", icon: "play", component: SessionTab },
  { id: "reflect", label: "Reflect", icon: "reflect", component: ReflectTab },
  { id: "more", label: "More", icon: "settings", component: MoreTab },
  { id: "covenant", label: "Covenant", component: CovenantTab, hidden: true },
  { id: "resources", label: "Resources", icon: "resources", component: ResourceDirectory, hidden: true },
  { id: "privacy", label: "Privacy", icon: "privacy", component: PrivacyTab, hidden: true },
];

export default function App() {
  const [activeTab, setActiveTab] = useState(() => getLocal("activeTab", "learn"));
  const [themeMode, setThemeMode] = useState(() => getLocal("themeMode", "light"));
  const [showOnboarding, setShowOnboarding] = useState(() => !getLocal("hasOnboarded", false));
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLocal("activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    setLocal("themeMode", themeMode);
  }, [themeMode]);

  useEffect(() => {
    const handler = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const C = themes[themeMode];
  const s = getStyles(C);

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || LearnTab;

  // Real-time indexing of LearnTab content for search
  const searchItems = [
    ...tabs.filter(t => !t.hidden).map(tab => ({ tab: tab.id, title: tab.label, text: `${tab.label} section navigation` })),
    { tab: "learn", title: "Marriage never replaces consent", text: "consent silence freeze maybe not permission" },
    { tab: "learn", title: "Nervous System Safety", text: "freeze fawn dissociation shutdown overwhelm" },
    { tab: "learn", title: "Christian Reflection", text: "faith spiritual conscience fruits of the spirit" },
    { tab: "learn", title: "BDSM Definitions", text: "bondage discipline dominance submission kink sm" },
    { tab: "connect", title: "Yes No Maybe worksheet", text: "limits hard soft not now mutual yes" },
    { tab: "inspire", title: "Fantasy Idea Generator", text: "scene inspiration ritual sensory worksheet non explicit consent" },
    { tab: "inspire", title: "Scene Planning Worksheet", text: "dynamic mood atmosphere boundaries safewords aftercare" },
    { tab: "prepare", title: "Tonight Plan Builder", text: "safeword non-verbal aftercare stop conditions" },
    { tab: "session", title: "Traffic lights", text: "green yellow red pause stop warmth" },
    { tab: "reflect", title: "Morning debrief", text: "aftercare pressure unsafe conscience red flag" },
    { tab: "resources", title: "Australian support", text: "000 1800RESPECT Lifeline MensLine Consent.gov.au" },
    { tab: "privacy", title: "Panic clear and local data", text: "localStorage clear worksheets plan debrief" },
    { tab: "covenant", title: "CovenantPower", text: "leadership submission sacred intimacy biblical marriage" },
  ];
  const results = searchItems.filter(item =>
    `${item.title} ${item.text}`.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 8);

  const handlePanicClear = () => {
    if (confirm("Instantly delete all data? This cannot be undone.")) {
      clearAllLocal();
      window.location.href = "about:blank";
    }
  };

  const handleOnboardingComplete = (nextTab = "learn") => {
    setLocal("hasOnboarded", true);
    setActiveTab(nextTab);
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Lato:wght@300;400;700&display=swap');
          body { margin: 0; background: ${C.cream}; }
        `}</style>
        <Onboarding C={C} s={s} onComplete={handleOnboardingComplete} />
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Lato:wght@300;400;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: ${C.cream}; transition: background 0.3s; overflow-x: hidden; }
        #root { min-height: 100vh; }
        
        .app-container {
          display: flex;
          flex-direction: column;
          padding-bottom: 80px;
        }
        .ActiveComponentWrapper {
          padding: 0 20px;
        }
        button { font-family: 'Lato', sans-serif; transition: all 0.2s ease-in-out; cursor: pointer; border: none; outline: 2px solid transparent; }
        button:focus-visible, a:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible {
          outline: 3px solid ${C.accent};
          outline-offset: 3px;
        }
        button:active { transform: scale(0.98); }
        textarea, input, select { outline: 2px solid transparent; transition: border-color 0.2s, background 0.3s, color 0.3s; }
        textarea:focus, input:focus, select:focus { border-color: ${C.accent} !important; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: ${C.rule}; border-radius: 3px; }
        
        .page-enter-active { 
          animation: fadeIn 300ms ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (min-width: 768px) {
          .app-container {
            display: grid;
            grid-template-columns: 120px 1fr;
            grid-template-rows: auto 1fr;
            height: 100vh;
            overflow: hidden;
            margin: 0 !important;
            box-shadow: none;
            border: none;
            padding-bottom: 0;
          }
          .ActiveComponentWrapper {
            padding: 0 40px;
          }
          .app-header {
            grid-column: 2 / 3;
            grid-row: 1 / 2;
            position: sticky;
            top: 0;
            z-index: 10;
            box-shadow: 0 1px 0 ${C.rule};
          }
          .main-nav {
            grid-column: 1 / 2;
            grid-row: 1 / 3;
            position: relative !important;
            top: 0 !important;
            bottom: 0 !important;
            left: 0 !important;
            transform: none !important;
            width: 120px !important;
            height: 100vh !important;
            flex-direction: column !important;
            border-top: none !important;
            border-right: 1px solid ${C.accent} !important;
            padding: 40px 10px !important;
            gap: 12px !important;
            z-index: 100;
          }
          .content-scroll {
            grid-column: 2 / 3;
            grid-row: 2 / 3;
            overflow-y: auto;
            padding: 0 0 60px 0;
            background: ${C.cream};
          }
          .header-inner {
            width: 100%;
            max-width: none;
            padding: 0 40px;
          }
          .search-shell, .flow-progress-container, .ActiveComponentWrapper {
            max-width: 1200px;
            margin-left: auto;
            margin-right: auto;
            padding: 0 40px;
          }
          .main-nav button {
            flex: 0 0 auto !important;
            min-height: 80px;
            border-radius: 10px;
          }
        }

        @media (max-width: 500px) {
          .main-nav .nav-label {
            display: none;
          }
          .main-nav button {
            padding: 14px 4px !important;
          }
        }

        @media (min-width: 1120px) {
          .content-scroll .wide-card-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }
        }
      `}</style>
      <div style={s.app} className="app-container">
        {/* Header */}
        <div style={s.header} className="app-header">
          <div className="header-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div onClick={() => setShowOnboarding(true)} style={{ cursor: "pointer" }}>
              <h1 style={s.headerTitle}>PowerApp</h1>
              <div style={s.headerSub}>Private · Educational · Safety-First</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button 
                onClick={handlePanicClear}
                title="Panic clear all data"
                aria-label="Panic clear all data"
                style={{
                  background: "rgba(196, 74, 58, 0.1)",
                  border: "1px solid #c44a3a",
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#c44a3a",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: 16
                }}
              >
                !
              </button>
              <button 
                onClick={() => setThemeMode(themeMode === "light" ? "dark" : "light")}
                aria-label={`Switch to ${themeMode === "light" ? "dark" : "light"} mode`}
                style={{
                  background: "none",
                  border: `1px solid ${C.accentLight}`,
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: C.accentLight,
                  cursor: "pointer",
                  padding: 0,
                  fontSize: 18
                }}
              >
                {themeMode === "light" ? "🌙" : "☀️"}
              </button>
            </div>
          </div>
        </div>

        {/* Active tab */}
        <div key={activeTab} className="page-enter-active content-scroll">
          <div className="search-shell" style={{ maxWidth: 1180, margin: "16px auto 0", padding: "0 24px" }}>
            <button onClick={() => setShowSearch(true)} style={{ ...s.btn("outline"), width: "100%", textAlign: "left", color: C.muted }}>
              Search the app... Ctrl/Cmd + K
            </button>
          </div>
          {["learn", "connect", "prepare", "session", "reflect"].includes(activeTab) && (
            <div className="flow-progress-container" style={{ maxWidth: 1180, margin: "24px auto 0", padding: "0 clamp(20px, 5vw, 72px)" }}>
              <FlowProgress C={C} active={activeTab} />
            </div>
          )}
          <div className="ActiveComponentWrapper">
            <ActiveComponent C={C} s={s} onNavigate={setActiveTab} />
          </div>
        </div>

        {showSearch && (
          <div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 50, padding: 20 }}>
            <div style={{ ...s.card, maxWidth: 560, margin: "8vh auto", background: C.warmWhite }}>
              <label style={s.label} htmlFor="global-search">Global Search</label>
              <input id="global-search" autoFocus style={s.input} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search consent, aftercare, privacy..." />
              <div style={{ display: "grid", gap: 8 }}>
                {results.map(item => (
                  <button key={`${item.tab}-${item.title}`} onClick={() => { setActiveTab(item.tab); setShowSearch(false); setSearch(""); }} style={{ ...s.btn("outline"), textAlign: "left" }}>
                    {item.title}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowSearch(false)} style={{ ...s.btn(), width: "100%", marginTop: 12 }}>Close</button>
            </div>
          </div>
        )}

        {/* Bottom Nav */}
        <nav style={s.nav} className="main-nav" aria-label="Main navigation">
          {tabs.filter(t => !t.hidden).map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              style={s.navBtn(activeTab === tab.id)}
              aria-current={activeTab === tab.id ? "page" : undefined}
            >
              <Icon name={tab.icon} size={20} />
              <span className="nav-label" style={{ fontSize: 8, fontWeight: activeTab === tab.id ? 700 : 400, marginTop: 2 }}>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
