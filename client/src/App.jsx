import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import BudgetAlerts from './components/BudgetAlerts';
import SDGImpact from './components/SDGImpact';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import BudgetSetup from './components/BudgetSetup';
import Chatbot from './components/Chatbot';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useCategories } from './hooks/useCategories';
import { useExpenses } from './hooks/useExpenses';
import './index.css';

// ── Theme tokens (Midnight Ember) ─
const T = {
  amber:       '#FF8C00',
  amberLight:  '#FFB347',
  amberDark:   '#CC6F00',
  cyan:        '#00D4FF',
  green:       '#00E676',
  orange:      '#FF6600',
  gradText:    'linear-gradient(135deg, #FFB347, #00D4FF)',
  gradBtn:     'linear-gradient(135deg, #FF8C00, #FF4500)',
  gradProg:    'linear-gradient(90deg, #FF8C00, #FF4500)',
};

// ── Gamification ──────────────────────────────────────────
const LEVELS = [
  { name: 'Budget Rookie 🌱', min: 0 },
  { name: 'Saver Cadet 💰', min: 100 },
  { name: 'Penny Pro 📊', min: 300 },
  { name: 'Budget Ninja 🥷', min: 600 },
  { name: 'Finance Guru 🧠', min: 1000 },
  { name: 'Money Master 👑', min: 2000 },
];

const getLevel = (pts) => {
  let lv = LEVELS[0];
  for (const l of LEVELS) { if (pts >= l.min) lv = l; }
  return lv;
};

// End of duplicated getStreak

const getStreak = () => {
  try {
    const d = JSON.parse(localStorage.getItem('sba_streak') || '{}');
    const today = new Date().toDateString();
    if (d.lastDate === today) return d.streak || 1;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (d.lastDate === yesterday) return (d.streak || 0) + 1;
    return 1;
  } catch { return 1; }
};

const saveStreak = (s) => {
  try { localStorage.setItem('sba_streak', JSON.stringify({ streak: s, lastDate: new Date().toDateString() })); } catch { }
};

// ── Avatar ────────────────────────────────────────────────
const Avatar = ({ name, size = 36 }) => {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '👤';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #FF8C00, #FF4500)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: size * 0.38, color: '#0C0A07',
      flexShrink: 0, userSelect: 'none'
    }}>
      {initials}
    </div>
  );
};

// ── Toast ─────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => (
  <div className={`toast toast-${type}`} style={{
    position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
    minWidth: '220px', cursor: 'pointer'
  }} onClick={onClose}>
    {message}
  </div>
);

// ── Auth Gate (shows Login / Signup or the main App) ──────
const AuthGate = () => {
  const { user, loading, isNewUser } = useAuth();
  const [view, setView] = useState('login'); // login | signup

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
      </div>
    );
  }

  if (user) {
    if (isNewUser) return <BudgetSetup />;
    return <MainApp />;
  }

  if (view === 'login') return <LoginPage onSwitch={() => setView('signup')} />;
  return <SignupPage onSwitch={() => setView('login')} />;
};

// ── Main App (only shown when logged in) ─────────────────
const TABS = ['Dashboard', 'Add Expense', 'SDG Impact'];
const TAB_ICONS = ['📊', '➕', '🌐'];

const MainApp = () => {
  const { user, logout } = useAuth();
  const { expenses, totals, loading, addExpense, deleteExpense } = useExpenses();
  const { CATEGORY_BUDGETS, CATEGORY_INFO, categories, addCategory, categorize, categorizing } = useCategories(user?._id);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [points, setPoints] = useState(() => parseInt(localStorage.getItem('sba_points') || '50'));
  const [streak] = useState(() => getStreak());
  const [toast, setToast] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const level = getLevel(points);
  const nextLevel = LEVELS.find(l => l.min > points);
  const progressToNext = nextLevel
    ? Math.round(((points - getLevel(points).min) / (nextLevel.min - getLevel(points).min)) * 100)
    : 100;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddExpense = async (data) => {
    const result = await addExpense(data);
    if (result) {
      const np = points + 10;
      setPoints(np);
      localStorage.setItem('sba_points', String(np));
      saveStreak(streak);
      showToast(`✅ ₹${data.amount} logged! +10 pts 🎉`);
      setActiveTab('Dashboard');
    }
  };

  const handleDelete = async (id) => {
    await deleteExpense(id);
    showToast('🗑️ Expense removed', 'info');
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
  };

  // Budget push notifications
  useEffect(() => {
    const checkAlerts = () => {
      // Use CATEGORY_BUDGETS from useCategories hook
      for (const [cat, budget] of Object.entries(CATEGORY_BUDGETS)) {
        const pct = Math.round(((totals[cat] || 0) / budget) * 100);
        if (pct >= 85 && Notification.permission === 'granted') {
          new Notification('StudentBudgetAI 🚨', { body: `${pct}% of ${cat} budget used!` });
        }
      }
    };
    if (Object.keys(totals).length > 0 && Object.keys(CATEGORY_BUDGETS).length > 0) {
      Notification.requestPermission().then(checkAlerts);
    }
  }, [totals, CATEGORY_BUDGETS]);

  const totalSpent = Object.values(totals).reduce((s, v) => s + v, 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Navbar ── */}
      <nav style={{
        background: 'rgba(13,17,23,0.88)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 24px', position: 'sticky', top: 0, zIndex: 200
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', height: '64px', gap: '16px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <span style={{ fontSize: '1.5rem', background: 'linear-gradient(135deg,#FF8C00,#FF4500)', padding: '6px', borderRadius: '10px', lineHeight: 1 }}>💸</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', background: T.gradText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                StudentBudgetAI
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '-2px' }}>AI-Powered Expense Tracker</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '2px', flex: 1, justifyContent: 'center' }}>
            {TABS.map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '8px 18px', borderRadius: '8px 8px 0 0', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
                background: activeTab === tab ? 'rgba(255,140,0,0.15)' : 'transparent',
                color: activeTab === tab ? T.amberLight : 'var(--text-secondary)',
                borderBottom: activeTab === tab ? `2px solid ${T.amber}` : '2px solid transparent',
              }}>
                {TAB_ICONS[i]} {tab}
              </button>
            ))}
          </div>

          {/* Right: streak + profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div style={{ background: 'rgba(255,140,0,0.07)', border: '1px solid rgba(255,140,0,0.2)', borderRadius: '10px', padding: '6px 12px', fontSize: '0.8rem', textAlign: 'center' }}>
              <div style={{ color: T.amberLight, fontWeight: 700 }}>🔥 {streak}d</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>{points} pts</div>
            </div>

            {/* Profile dropdown trigger */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setProfileOpen(v => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', borderRadius: '10px', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <Avatar name={user?.name} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name || 'Student'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{level.name}</div>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>▾</span>
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: 'rgba(22,27,34,0.98)', backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                  minWidth: '200px', zIndex: 300, boxShadow: 'var(--shadow)',
                  animation: 'fadeIn 0.2s ease'
                }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar name={user?.name} size={40} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.name}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{user?.email}</div>
                        {user?.college && <div style={{ color: 'var(--purple-light)', fontSize: '0.72rem', marginTop: '2px' }}>🏫 {user.college}</div>}
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '8px' }}>
                    <div style={{ padding: '10px 12px', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Points</span><span style={{ color: T.amberLight, fontWeight: 700 }}>{points} pts</span>
                    </div>
                    <div style={{ padding: '10px 12px', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Streak</span><span style={{ color: T.orange, fontWeight: 700 }}>🔥 {streak} days</span>
                    </div>
                    <div style={{ padding: '10px 12px', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Level</span><span style={{ fontWeight: 700, fontSize: '0.78rem' }}>{level.name}</span>
                    </div>
                    <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.07)', margin: '4px 0' }} />
                    <button onClick={handleLogout}
                      style={{ width: '100%', padding: '10px 12px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', color: 'var(--red)', fontWeight: 600, textAlign: 'left', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(252,129,129,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Click outside to close dropdown */}
      {profileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setProfileOpen(false)} />
      )}

      {/* ── Main ── */}
      <main style={{ flex: 1, padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>

        {/* Level progress */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
            <span>{level.name}</span>
            <span>{nextLevel ? `${nextLevel.min - points} pts to ${nextLevel.name}` : '🏆 Max Level!'}</span>
          </div>
          <div className="progress-bar" style={{ height: '4px' }}>
            <div className="progress-fill" style={{ width: `${progressToNext}%`, background: T.gradProg, boxShadow: '0 0 10px rgba(255,140,0,0.45)' }} />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }} />
            <div>Loading expenses...</div>
          </div>
        )}

        {/* Tab Content */}
        {!loading && (
          <div style={{ flex: 1, padding: '24px 0', maxWidth: '800px', margin: '0 auto', width: '100%', position: 'relative' }}>
            {activeTab === 'Dashboard' && (
              <div className="stagger-children">
                <Dashboard
                  expenses={expenses}
                  totals={totals}
                  onDelete={handleDelete}
                  budgets={CATEGORY_BUDGETS}
                  categoryInfo={CATEGORY_INFO}
                />
                <div style={{ marginTop: '24px' }}>
                  <BudgetAlerts totals={totals} budgets={CATEGORY_BUDGETS} categoryInfo={CATEGORY_INFO} />
                </div>
              </div>
            )}

            {activeTab === 'Add Expense' && (
              <ExpenseForm onAdd={handleAddExpense} categories={categories} categoryInfo={CATEGORY_INFO} categorize={categorize} categorizing={categorizing} addCategory={addCategory} />
            )}

            {activeTab === 'SDG Impact' && (
              <div style={{ maxWidth: '700px', margin: '0 auto', width: '100%' }}>
                <SDGImpact expenses={expenses} totals={totals} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Global Floating Chatbot */}
      <Chatbot />

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
        Built for 🏆 Hackathon 2026 · StudentBudgetAI ·{' '}
        <span style={{ color: 'var(--green)' }}>AI-EdTech/FinTech · SDG 1 · 8 · 12</span>
      </footer>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

// ── Root Export ────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
