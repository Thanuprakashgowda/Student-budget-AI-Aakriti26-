import React, { useState } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Midnight Ember chart palette
const COLORS = ['#FF8C00', '#00D4FF', '#00E676', '#FF5252'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(22,27,34,0.95)',
        border: '1px solid rgba(139,92,246,0.3)',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '0.85rem'
      }}>
        <p style={{ color: payload[0].color, fontWeight: 700 }}>{payload[0].name}</p>
        <p style={{ color: '#F0F6FC' }}>₹{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const StatItem = ({ label, value, color }) => (
  <div style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: color || '#fff' }}>{value}</div>
  </div>
);

const TransactionRow = ({ expense, onDelete, categoryInfo }) => {
  const info = categoryInfo[expense.category] || { emoji: '💸', color: '#FF8C00' };
  const dateStr = new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <div className="transaction-row animate-up">
      <div className="icon-box" style={{ background: `${info.color}15`, color: info.color }}>
        {info.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {expense.description}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
          {expense.category} • {dateStr}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>₹{expense.amount}</div>
        <button 
          onClick={() => onDelete(expense._id)}
          style={{ background: 'none', border: 'none', color: 'var(--crimson)', fontSize: '0.7rem', padding: '4px', cursor: 'pointer', opacity: 0.6 }}
        >Remove</button>
      </div>
    </div>
  );
};

const Dashboard = ({ expenses, totals, onDelete, onUpdateBudget, budgets, categoryInfo, officialTotalBudget }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showBudgetEditor, setShowBudgetEditor] = useState(false);

  const totalSpent = totals.total || 0;
  const totalBudget = officialTotalBudget || 0;
  const pieData = Object.entries(totals).filter(([k, v]) => v > 0 && k !== 'total').map(([name, value]) => ({ name, value }));
  const recentExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Quick Summary Stats */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <StatItem label="Daily Avg" value={`₹${Math.round(totalSpent / 30).toLocaleString()}`} />
        <StatItem label="Top Cat" value={pieData[0]?.name || 'N/A'} color="var(--ember)" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '14px', width: 'fit-content' }}>
        {['overview', 'charts', 'history'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: 600,
            background: activeTab === tab ? 'var(--ember)' : 'transparent',
            color: activeTab === tab ? '#000' : 'var(--text-dim)',
            transition: 'all 0.2s'
          }}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="animate-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Recent Activity</h3>
            <button onClick={() => setActiveTab('history')} style={{ background: 'none', border: 'none', color: 'var(--ember)', fontSize: '0.85rem', fontWeight: 600 }}>See All</button>
          </div>
          <div className="glass-pane" style={{ padding: '0 16px' }}>
            {recentExpenses.length > 0 ? (
              recentExpenses.map(exp => (
                <TransactionRow key={exp._id} expense={exp} onDelete={onDelete} categoryInfo={categoryInfo} />
              ))
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
                No expenses yet. Start by adding one! 🚀
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'charts' && (
        <div className="animate-up">
          <div className="glass-pane" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px' }}>Spending Analysis</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={categoryInfo[entry.name]?.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0A0A0A', border: '1px solid #333', borderRadius: '12px' }} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                Not enough data for visualization yet.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="animate-up">
          <h3 style={{ marginBottom: '16px' }}>Full History</h3>
          <div className="glass-pane" style={{ padding: '0 16px' }}>
            {expenses.map(exp => (
              <TransactionRow key={exp._id} expense={exp} onDelete={onDelete} categoryInfo={categoryInfo} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;