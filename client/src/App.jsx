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

const BudgetSetupWizard = ({ onComplete, categories }) => {
  const [total, setTotal] = useState('');
  const [allocations, setAllocations] = useState({});
  const [step, setStep] = useState(1);

  const remaining = parseFloat(total || 0) - Object.values(allocations).reduce((a, b) => a + b, 0);

  const handleComplete = () => {
    if (remaining < 0) return alert("Total allocation cannot exceed your monthly budget!");
    if (parseFloat(total) <= 0) return alert("Please enter a valid monthly budget!");
    onComplete(parseFloat(total), allocations);
  };

  return (
    <div className="modal-overlay animate-fade-in" style={{ zIndex: 2000 }}>
      <div className="glass-card" style={{ width: '90%', maxWidth: '500px', padding: '32px', textAlign: 'center' }}>
        {step === 1 ? (
          <>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '16px' }}>💰 Set Your Monthly Budget</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>How much money do you want to manage this month?</p>
            <input 
              type="number" 
              placeholder="e.g. 20000" 
              className="expense-input" 
              style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '24px' }}
              value={total}
              onChange={(e) => setTotal(e.target.value)}
            />
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => total > 0 && setStep(2)}>Next ➔</button>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🏷️ Allocate Categories</h2>
            <div style={{ padding: '8px 16px', background: 'rgba(255,140,0,0.1)', borderRadius: '12px', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Remaining to Allocate</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: remaining < 0 ? '#FC8181' : 'var(--amber)' }}>₹{remaining.toLocaleString()}</div>
            </div>
            
            <div style={{ maxHeight: '40vh', overflowY: 'auto', textAlign: 'left', paddingRight: '12px' }}>
              {categories.map(cat => (
                <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{cat.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{cat.name}</div>
                    <input 
                      type="number" 
                      className="expense-input" 
                      style={{ padding: '8px' }}
                      value={allocations[cat.name] || ''}
                      onChange={(e) => setAllocations({ ...allocations, [cat.name]: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleComplete}>Save My Budget</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const MainApp = () => {
  const { user, logout } = useAuth();
  const { expenses, totals, loading, addExpense, deleteExpense } = useExpenses();
  const { CATEGORY_BUDGETS, CATEGORY_INFO, categories, addCategory, categorize, categorizing, updateBudget, totalBudget, updateAllBudgets } = useCategories(user?._id, user?.budgets, user?.totalMonthlyBudget);
  
  const [setupRequired, setSetupRequired] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [points, setPoints] = useState(() => parseInt(localStorage.getItem('sba_points') || '50'));
  const [streak] = useState(() => getStreak());
  const [toast, setToast] = useState(null);

  const level = getLevel(points);
  const nextLevel = LEVELS.find(l => l.min > points);
  
  useEffect(() => {
    if (totalBudget === 0 && user?._id && user?._id !== 'demo-user-id') {
      setSetupRequired(true);
    } else {
      setSetupRequired(false);
    }
  }, [totalBudget, user?._id]);

  const handleSetupComplete = async (userId, newTotal, budgetsMap) => {
    await updateAllBudgets(newTotal, budgetsMap);
    setSetupRequired(false);
    showToast("Budget setup complete! 🎯");
  };

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

  return (
    <div className="animate-up" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── App Header ── */}
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.8rem' }}>🔥</span>
          <h1 style={{ fontSize: '1.2rem', margin: 0 }}>StudentBudget<span className="text-gradient">AI</span></h1>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
          ⚡ {points} pts
        </div>
      </header>

      {/* ── Main Container ── */}
      <div className="container">
        
        {/* Wallet Summary Card */}
        <section style={{ marginBottom: '24px' }}>
          <div className="wallet-card">
            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>
              Remaining Budget
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '20px' }}>
              ₹{Math.max(0, totalBudget - totals.total).toLocaleString()}
            </div>
            <div className="pill-bar">
              <div 
                className="pill-fill" 
                style={{ 
                  width: `${totalBudget > 0 ? Math.min(100, (totals.total / totalBudget) * 100) : 0}%`, 
                  background: 'linear-gradient(90deg, var(--gold), var(--ember))' 
                }} 
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              <span>Spent: ₹{totals.total.toLocaleString()}</span>
              <span>Goal: ₹{totalBudget.toLocaleString()}</span>
            </div>
          </div>
        </section>

        {/* Tab Content */}
        {!loading ? (
          <div style={{ minHeight: '400px' }}>
            {activeTab === 'Dashboard' && (
              <Dashboard
                expenses={expenses}
                totals={totals}
                onDelete={handleDelete}
                onUpdateBudget={updateBudget}
                budgets={CATEGORY_BUDGETS}
                categoryInfo={CATEGORY_INFO}
                officialTotalBudget={totalBudget}
              />
            )}

            {activeTab === 'Add Expense' && (
              <ExpenseForm onAdd={handleAddExpense} categories={categories} categoryInfo={CATEGORY_INFO} categorize={categorize} categorizing={categorizing} addCategory={addCategory} />
            )}

            {activeTab === 'SDG Impact' && (
              <SDGImpact expenses={expenses} totals={totals} />
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div className="spinner" />
          </div>
        )}
      </div>

      {/* ── Fixed Navigation Dock ── */}
      <nav className="nav-dock">
        {TABS.map((tab, i) => (
          <button 
            key={tab} 
            className={`dock-item ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <span className="dock-icon">{TAB_ICONS[i]}</span>
            <span>{tab === 'Add Expense' ? 'Add' : tab}</span>
          </button>
        ))}
      </nav>

      {/* Global Floating Chatbot */}
      <Chatbot />

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      {setupRequired && (
        <BudgetSetupWizard 
          onComplete={(total, budgets) => handleSetupComplete(user?._id, total, budgets)} 
          categories={categories} 
        />
      )}
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
