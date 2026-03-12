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

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="glass-card animate-fade-in" style={{ padding: '20px 24px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
      <span style={{
        fontSize: '1.6rem',
        background: `${color}20`, padding: '8px',
        borderRadius: '10px', lineHeight: 1
      }}>{icon}</span>
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    </div>
    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF8F0', lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>{sub}</div>}
  </div>
);

const ExpenseRow = ({ expense, onDelete, categoryInfo }) => {
  const info = categoryInfo[expense.category] || { emoji: '💸', color: '#00D4FF' };
  const emoji = info.emoji;
  const color = info.color;
  const dateStr = new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      animation: 'fadeIn 0.3s ease'
    }}>
      <span style={{
        fontSize: '1.3rem', background: `${color}20`, padding: '8px',
        borderRadius: '8px', lineHeight: 1, flexShrink: 0
      }}>{emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {expense.description}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
          <span className={`badge badge-${expense.category.toLowerCase()}`}>{expense.category}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{dateStr}</span>
          <span style={{ fontSize: '0.8rem', opacity: 0.8 }} title={expense.source === 'whatsapp' ? 'Logged via WhatsApp' : 'Logged via Web'}>
            {expense.source === 'whatsapp' ? '📱' : '💻'}
          </span>
          {(expense.amount_encrypted || expense.description_encrypted) && (
            <span style={{ fontSize: '0.8rem', opacity: 0.7 }} title="Encrypted at rest">🔒</span>
          )}
          {expense.aiConfidence > 0 && (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
              🤖 {Math.round(expense.aiConfidence * 100)}%
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#F0F6FC' }}>₹{expense.amount}</span>
        <button
          className="btn btn-danger"
          style={{ padding: '5px 10px', fontSize: '0.75rem' }}
          onClick={() => onDelete(expense._id)}
        >✕</button>
      </div>
    </div>
  );
};

const Dashboard = ({ expenses, totals, onDelete, budgets, categoryInfo }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const totalSpent = Object.values(totals).reduce((s, v) => s + v, 0);
  const totalBudget = Object.values(budgets).reduce((s, v) => s + v, 0);
  const totalSaved = totalBudget - totalSpent;
  const savingsPct = Math.round((totalSaved / totalBudget) * 100);

  const pieData = Object.entries(totals).map(([name, value]) => ({ name, value }));
  const allCats = Array.from(new Set([...Object.keys(budgets), ...Object.keys(totals)]));
  const barData = allCats.map(cat => ({
    category: cat,
    Spent: totals[cat] || 0,
    Budget: budgets[cat] || 0,
  }));

  const recentExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  const exportStatementPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 140, 0); // Amber
    doc.text("StudentBudgetAI", 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text("Official Expense Statement", 14, 30);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 38);
    doc.text(`Total Lifetime Expenses: ${expenses.length} transactions`, 14, 44);
    doc.text(`Total Lifetime Spent: Rs. ${Object.values(totals).reduce((a,b)=>a+b, 0).toLocaleString()}`, 14, 50);

    // Table Data
    const tableColumn = ["Date", "Description", "Category", "Amount (INR)"];
    const tableRows = [];

    // Sort all expenses newest to oldest
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedExpenses.forEach(exp => {
      const row = [
        new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        exp.description,
        exp.category,
        exp.amount.toFixed(2)
      ];
      tableRows.push(row);
    });

    let finalY = 60;
    
    if (tableRows.length > 0) {
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 60,
        theme: 'striped',
        headStyles: { fillColor: [255, 140, 0], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        styles: { fontSize: 10, cellPadding: 5 }
      });
      finalY = doc.lastAutoTable.finalY || 60;
    } else {
      doc.text("No expenses recorded yet.", 14, 60);
    }
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Confidential & securely generated by StudentBudgetAI.", 14, finalY + 15);

    doc.save(`Statement_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Tabs & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
          {['overview', 'charts', 'history'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '8px 20px', borderRadius: '9px', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
              background: activeTab === tab ? 'linear-gradient(135deg,#8B5CF6,#3B82F6)' : 'transparent',
              color: activeTab === tab ? '#fff' : 'var(--text-secondary)'
            }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        
        <button 
          onClick={exportStatementPDF}
          className="btn btn-ghost"
          style={{ padding: '8px 16px', fontSize: '0.85rem', border: '1px solid var(--amber)', color: 'var(--amber)' }}
        >
          📄 Export Statement
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}
            className="stagger-children">
            <StatCard icon="💸" label="Total Spent" value={`₹${totalSpent.toLocaleString()}`} sub="This month" color="#8B5CF6" />
            <StatCard icon="💰" label="Saved" value={`₹${Math.max(0, totalSaved).toLocaleString()}`} sub={`${Math.max(0, savingsPct)}% of budget`} color="#48BB78" />
            <StatCard icon="📊" label="Transactions" value={expenses.length} sub="Expenses logged" color="#63B3ED" />
            <StatCard icon="🎯" label="Budget Left" value={`₹${Math.max(0, totalBudget - totalSpent).toLocaleString()}`} sub={`of ₹${totalBudget.toLocaleString()}`} color="#F6AD55" />
          </div>

          {/* Category progress */}
          <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              📈 Category Budgets
            </h3>
            {allCats.map(cat => {
              const budget = budgets[cat] || 0;
              const spent = totals[cat] || 0;
              const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : (spent > 0 ? 100 : 0);
              const barColor = pct < 60 ? '#48BB78' : pct < 85 ? '#F6C90E' : '#FC8181';
              const info = categoryInfo[cat] || { emoji: '🏷️' };
              return (
                <div key={cat} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.87rem' }}>
                    <span style={{ fontWeight: 600 }}>{info.emoji} {cat}</span>
                    <span style={{ color: barColor }}>₹{spent.toLocaleString()} / ₹{budget.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}aa, ${barColor})` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'charts' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: 700 }}>🥧 Spending Breakdown</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                    paddingAngle={4} dataKey="value" nameKey="name">
                    {pieData.map((entry, index) => {
                      const color = categoryInfo[entry.name]?.color || COLORS[index % COLORS.length];
                      return <Cell key={entry.name} fill={color} stroke="transparent" />;
                    })}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Add expenses to see chart</p>}
          </div>

          <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--amber)' }}>📊</span> Budget vs Spent
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData} margin={{ top: 20, right: 10, left: -15, bottom: 5 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--amber)" stopOpacity={1} />
                    <stop offset="100%" stopColor="var(--amber-dark)" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.12)" stopOpacity={1} />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.02)" stopOpacity={0.5} />
                  </linearGradient>
                  {/* Category specific gradients */}
                  <linearGradient id="grad-Food" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF8C00" stopOpacity={1} />
                    <stop offset="100%" stopColor="#CC6F00" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="grad-Transport" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00D4FF" stopOpacity={1} />
                    <stop offset="100%" stopColor="#007791" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="grad-Study" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00E676" stopOpacity={1} />
                    <stop offset="100%" stopColor="#00A152" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="grad-Entertainment" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF5252" stopOpacity={1} />
                    <stop offset="100%" stopColor="#C62828" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis 
                  dataKey="category" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                />
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{ fill: 'rgba(255,255,255,0.03)', radius: [8, 8, 0, 0] }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '20px', fontSize: '11px', fontWeight: 600 }}
                  formatter={(value) => <span style={{ color: 'var(--text-secondary)', paddingLeft: '4px' }}>{value}</span>}
                />
                <Bar 
                  dataKey="Budget" 
                  fill="url(#budgetGradient)" 
                  radius={[6, 6, 0, 0]} 
                  barSize={32}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth={1}
                />
                <Bar 
                  dataKey="Spent" 
                  radius={[6, 6, 0, 0]} 
                  barSize={32}
                  activeBar={{ filter: 'brightness(1.2) drop-shadow(0 0 8px rgba(255,140,0,0.3))' }}
                >
                  {barData.map((entry, index) => {
                    const gradId = `url(#grad-${entry.category})`;
                    const fallbackColor = COLORS[index % COLORS.length];
                    return <Cell key={entry.category} fill={["Food", "Transport", "Study", "Entertainment"].includes(entry.category) ? gradId : fallbackColor} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: 700 }}>🧾 Recent Expenses</h3>
          {recentExpenses.length === 0
            ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No expenses yet</p>
            : recentExpenses.map(exp => (
              <ExpenseRow key={exp._id} expense={exp} onDelete={onDelete} categoryInfo={categoryInfo} />
            ))
          }
        </div>
      )}
    </div>
  );
};

export default Dashboard;
