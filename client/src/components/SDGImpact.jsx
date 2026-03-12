import React from 'react';

const SDG_DATA = [
  {
    id: 1, goal: 'SDG 1', title: 'No Poverty', icon: '🌍', color: '#E5243B',
    metric: '₹24,500', label: 'saved by users this month',
    stats: [{ l: 'Avg Monthly Savings', v: '₹2,450' }, { l: 'Students Benefited', v: '1,240' }, { l: 'Budget Adherence', v: '78%' }]
  },
  {
    id: 8, goal: 'SDG 8', title: 'Decent Work & Growth', icon: '💼', color: '#A21942',
    metric: '10,000+', label: 'students gaining financial skills',
    stats: [{ l: 'Active Users', v: '10,240' }, { l: 'Expenses Tracked', v: '48,500' }, { l: 'Goal Completion', v: '65%' }]
  },
  {
    id: 12, goal: 'SDG 12', title: 'Responsible Consumption', icon: '♻️', color: '#BF8B2E',
    metric: '23%', label: 'reduction in impulsive spending',
    stats: [{ l: 'Savings Boost', v: '+30%' }, { l: 'Budget Alerts Sent', v: '3,890' }, { l: 'Avg Savings Rate', v: '18%' }]
  }
];

const PITCH_METRICS = [
  { icon: '📈', value: '30%', label: 'Avg Savings Boost', color: '#48BB78' },
  { icon: '🎓', value: '10K+', label: 'Student Reach', color: '#63B3ED' },
  { icon: '🤖', value: '85%', label: 'AI Accuracy', color: '#9F7AEA' },
  { icon: '🏆', value: '₹4.8M', label: 'Total Tracked', color: '#F6AD55' },
];

const SDGCard = ({ sdg }) => (
  <div className="glass-card" style={{
    padding: '20px',
    borderLeft: `3px solid ${sdg.color}`,
    transition: 'all 0.2s'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
      <span style={{
        fontSize: '1.6rem', background: `${sdg.color}20`,
        padding: '8px', borderRadius: '10px', lineHeight: 1
      }}>{sdg.icon}</span>
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: sdg.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {sdg.goal}
        </div>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{sdg.title}</div>
      </div>
    </div>

    <div style={{ marginBottom: '14px' }}>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: sdg.color, lineHeight: 1 }}>{sdg.metric}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{sdg.label}</div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
      {sdg.stats.map(s => (
        <div key={s.l} style={{
          background: `${sdg.color}10`, borderRadius: '8px',
          padding: '8px 6px', textAlign: 'center'
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: sdg.color }}>{s.v}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.2 }}>{s.l}</div>
        </div>
      ))}
    </div>
  </div>
);

const SDGImpact = () => (
  <div className="glass-card animate-fade-in" style={{ padding: '28px' }}>
    {/* Header */}
    <div style={{ marginBottom: '24px' }}>
      <h2 style={{
        fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px',
        background: 'linear-gradient(135deg,#A78BFA,#60A5FA)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
      }}>🌐 SDG Impact Dashboard</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>
        StudentBudgetAI contributes to UN Sustainable Development Goals
      </p>
    </div>

    {/* Pitch metrics */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}
      className="stagger-children">
      {PITCH_METRICS.map(m => (
        <div key={m.label} className="animate-fade-in" style={{
          background: `${m.color}10`, border: `1px solid ${m.color}25`,
          borderRadius: '12px', padding: '14px',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <span style={{ fontSize: '1.4rem' }}>{m.icon}</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: m.color }}>{m.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{m.label}</div>
          </div>
        </div>
      ))}
    </div>

    {/* SDG Cards */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {SDG_DATA.map(sdg => <SDGCard key={sdg.id} sdg={sdg} />)}
    </div>

    {/* Badges */}
    <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(139,92,246,0.08)', borderRadius: '12px', border: '1px solid rgba(139,92,246,0.2)' }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--purple-light)', marginBottom: '10px' }}>
        🏅 Impact Badges
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {['💰 Budget Master', '🤖 AI Pioneer', '📊 Data Driven', '🌱 Eco Saver', '🎓 Smart Student', '🏆 Streak Champion'].map(badge => (
          <span key={badge} style={{
            padding: '5px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600,
            background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
            color: 'var(--purple-light)'
          }}>{badge}</span>
        ))}
      </div>
    </div>
  </div>
);

export default SDGImpact;
