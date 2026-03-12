import React, { useMemo } from 'react';

const AlertItem = ({ category, spent, budget, categoryInfo }) => {
  const pct = Math.min(100, Math.round((spent / budget) * 100));
  const info = categoryInfo[category] || { emoji: '🏷️', color: '#00D4FF' };
  const emoji = info.emoji;
  const status = pct >= 85 ? 'danger' : pct >= 60 ? 'warning' : 'ok';
  const remaining = budget - spent;

  if (status === 'ok') return null;

  const bgColor = status === 'danger' ? 'rgba(252,129,129,0.1)' : 'rgba(246,173,85,0.1)';
  const borderColor = status === 'danger' ? 'rgba(252,129,129,0.3)' : 'rgba(246,173,85,0.3)';
  const textColor = status === 'danger' ? 'var(--red)' : 'var(--orange)';
  const icon = status === 'danger' ? '🚨' : '⚠️';

  return (
    <div style={{
      background: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: '12px',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      animation: 'fadeIn 0.3s ease',
      marginBottom: '8px'
    }}>
      <span style={{ fontSize: '1.3rem' }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, color: textColor, fontSize: '0.9rem' }}>
          {emoji} {pct}% of {category} budget used!
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          ₹{spent.toLocaleString()} spent · ₹{Math.max(0, remaining).toLocaleString()} remaining
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{
          fontSize: '1.2rem', fontWeight: 800, color: textColor
        }}>{pct}%</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>budget</div>
      </div>
    </div>
  );
};

const BudgetAlerts = ({ totals, budgets, categoryInfo }) => {
  const alerts = useMemo(() => {
    return Object.entries(budgets)
      .map(([cat, budget]) => ({ category: cat, spent: totals[cat] || 0, budget }))
      .filter(a => a.spent / a.budget >= 0.60)
      .sort((a, b) => (b.spent / b.budget) - (a.spent / a.budget));
  }, [totals, budgets]);

  const totalSpent = Object.values(totals).reduce((s, v) => s + v, 0);
  const totalBudget = Object.values(budgets).reduce((s, v) => s + v, 0);
  const overallPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>🔔 Budget Alerts</h3>
        <span style={{
          padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700,
          background: overallPct >= 85 ? 'rgba(252,129,129,0.2)' : overallPct >= 60 ? 'rgba(246,173,85,0.2)' : 'rgba(72,187,120,0.2)',
          color: overallPct >= 85 ? 'var(--red)' : overallPct >= 60 ? 'var(--orange)' : 'var(--green)'
        }}>
          Overall: {overallPct}%
        </span>
      </div>

      {alerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🟢</div>
          <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: '1rem' }}>All budgets healthy!</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>
            You're spending wisely ✨
          </div>
        </div>
      ) : (
        <div>
          {Object.entries(budgets).map(([cat, budget]) => (
            <AlertItem key={cat} category={cat} spent={totals[cat] || 0} budget={budget} categoryInfo={categoryInfo} />
          ))}
        </div>
      )}

      {/* Tips */}
      <div style={{
        marginTop: '16px', background: 'rgba(255,140,0,0.08)',
        border: '1px solid rgba(255,140,0,0.2)', borderRadius: '10px',
        padding: '12px 14px'
      }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--amber-light)', marginBottom: '4px' }}>
          💡 Smart Tip
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {overallPct > 85
            ? 'You\'ve exceeded 85% of your budget! Consider reducing discretionary spending.'
            : overallPct > 60
              ? 'You\'re over halfway through your budget. Keep tracking to stay on goal!'
              : 'Great job! You\'re within budget. Keep saving for future goals 🎯'}
        </div>
      </div>
    </div>
  );
};

export default BudgetAlerts;
