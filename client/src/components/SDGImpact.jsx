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
  <div className="glass-pane animate-up" style={{
    padding: '20px',
    borderLeft: `4px solid ${sdg.color}`,
    marginBottom: '16px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px',
        background: `${sdg.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.4rem'
      }}>{sdg.icon}</div>
      <div>
        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: sdg.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {sdg.goal}
        </div>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{sdg.title}</div>
      </div>
    </div>

    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: sdg.color }}>{sdg.metric}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{sdg.label}</div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
      {sdg.stats.map(s => (
        <div key={s.l} style={{
          background: 'rgba(255,255,255,0.02)', borderRadius: '12px',
          padding: '10px 4px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.03)'
        }}>
          <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#fff' }}>{s.v}</div>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-dim)', marginTop: '2px', textTransform: 'uppercase' }}>{s.l}</div>
        </div>
      ))}
    </div>
  </div>
);

const SDGImpact = () => (
  <div className="animate-up">
    {/* Header */}
    <div style={{ marginBottom: '24px' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
        SDG Impact <span className="text-gradient">Dashboard</span>
      </h2>
      <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
        How your financial habits contribute to global goals.
      </p>
    </div>

    {/* Pitch metrics */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
      {PITCH_METRICS.map(m => (
        <div key={m.label} className="glass-pane" style={{
          padding: '16px',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <span style={{ fontSize: '1.6rem' }}>{m.icon}</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: m.color }}>{m.value}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 600 }}>{m.label}</div>
          </div>
        </div>
      ))}
    </div>

    {/* SDG Cards */}
    <div>
      {SDG_DATA.map(sdg => <SDGCard key={sdg.id} sdg={sdg} />)}
    </div>

    {/* Badges */}
    <div className="glass-pane" style={{ marginTop: '12px', padding: '20px', border: '1px solid rgba(255,140,0,0.1)' }}>
      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--ember)', marginBottom: '12px', textTransform: 'uppercase' }}>
        🏅 Impact Badges
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {['💰 Budget Master', '🤖 AI Pioneer', '📊 Data Driven', '🌱 Eco Saver', '🎓 Smart Student', '🏆 Streak'].map(badge => (
          <span key={badge} style={{
            padding: '6px 12px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 700,
            background: 'rgba(255,140,0,0.06)', border: '1px solid rgba(255,140,0,0.1)',
            color: 'var(--ember)'
          }}>{badge}</span>
        ))}
      </div>
    </div>
  </div>
);

export default SDGImpact;
