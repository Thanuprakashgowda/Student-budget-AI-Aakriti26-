import React, { useState, useEffect } from 'react';
import { useCategories } from '../hooks/useCategories';
import VoiceInput from './VoiceInput';

const ExpenseForm = ({ onAdd, categories, categoryInfo, categorize, categorizing, addCategory }) => {
  const [form, setForm] = useState({
    amount: '',
    description: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0]
  });
  const [aiResult, setAiResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [showCustomCat, setShowCustomCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('🏷️');
  const [newCatBudget, setNewCatBudget] = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Auto-categorize on description change
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (form.description.length > 3) {
        const result = await categorize(form.description);
        if (result) {
          setAiResult(result);
          setForm(f => ({ ...f, category: result.category }));
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [form.description]); // eslint-disable-line

  const handleVoiceInput = (parsed) => {
    setForm(f => ({
      ...f,
      amount: parsed.amount ? String(parsed.amount) : f.amount,
      description: parsed.description || f.description,
      category: parsed.category || f.category
    }));
    if (parsed.category) {
      setAiResult({ category: parsed.category, confidence: 0.9 });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.description) {
      showToast('Please fill amount and description', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await onAdd({
        amount: parseFloat(form.amount),
        description: form.description.trim(),
        category: form.category,
        date: form.date,
        aiConfidence: aiResult?.confidence || 0
      });
      setForm({ amount: '', description: '', category: 'Food', date: new Date().toISOString().split('T')[0] });
      setAiResult(null);
      showToast('Expense added! +10 pts 🎉');
    } finally {
      setSubmitting(false);
    }
  };

  const info = categoryInfo[form.category] || { color: '#FF8C00', emoji: '🏷️' };
  const catColor = info.color;
  const catEmoji = info.emoji;

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, background: 'linear-gradient(135deg,#A78BFA,#60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ➕ Add Expense
        </h2>
        <VoiceInput onResult={handleVoiceInput} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Amount */}
        <div>
          <label className="form-label">Amount (₹)</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 700, fontSize: '1rem' }}>₹</span>
            <input
              type="number"
              className="form-input"
              style={{ paddingLeft: '32px' }}
              placeholder="0.00"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        {/* Description with AI badge */}
        <div>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Description
            {/* Removed AI detecting text for now, using basic selection */}
            {aiResult && !categorizing && (
              <span style={{ color: 'var(--green)', fontSize: '0.75rem' }}>
                🤖 {aiResult.category} ({Math.round(aiResult.confidence * 100)}%)
              </span>
            )}
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. 2 chai at canteen"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            required
          />
        </div>

        {/* Category selector */}
        <div>
          <label className="form-label">Category</label>
          <div style={{ display: 'flex', gap: '8px', height: '42px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <select
                className="form-input"
                style={{ width: '100%', height: '100%', appearance: 'none', paddingRight: '30px' }}
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              >
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>
                    {categoryInfo[cat.name]?.emoji || '🏷️'} {cat.name}
                  </option>
                ))}
              </select>
              <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>▼</span>
            </div>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowCustomCat(!showCustomCat)}
              style={{ padding: '0 16px', borderRadius: '10px', height: '100%', border: '1px dashed var(--amber)' }}
            >
              + New
            </button>
          </div>

          {showCustomCat && (
            <div className="animate-fade-in" style={{ marginTop: '12px', background: 'rgba(255,140,0,0.06)', padding: '16px', borderRadius: '12px', border: '1px solid var(--amber)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--amber)' }}>Create Custom Category</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input 
                  type="text" className="form-input" placeholder="Emoji (e.g. 🏋️)" 
                  value={newCatEmoji} onChange={e => setNewCatEmoji(e.target.value)}
                  style={{ width: '60px', textAlign: 'center', padding: '8px' }} 
                />
                <input 
                  type="text" className="form-input" placeholder="Category Name" 
                  value={newCatName} onChange={e => setNewCatName(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px' }} autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Monthly Budget: ₹</span>
                <input 
                  type="number" className="form-input" placeholder="Amount" 
                  value={newCatBudget} onChange={e => setNewCatBudget(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px' }} 
                />
                <button 
                  type="button" className="btn btn-primary" 
                  style={{ padding: '8px 16px' }}
                  onClick={() => {
                    if (newCatName && newCatBudget) {
                      addCategory(newCatName.trim(), Number(newCatBudget), newCatEmoji);
                      setForm(f => ({ ...f, category: newCatName.trim() }));
                      setShowCustomCat(false);
                      setNewCatName('');
                      setNewCatBudget('');
                    } else {
                      showToast('Name and budget required', 'error');
                    }
                  }}
                >Add</button>
              </div>
            </div>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="form-label">Date</label>
          <input
            type="date"
            className="form-input"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          />
        </div>

        {/* Selected preview */}
        <div style={{
          background: `${catColor}10`, border: `1px solid ${catColor}30`,
          borderRadius: '10px', padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <span style={{ fontSize: '1.4rem' }}>{catEmoji}</span>
          <div>
            <div style={{ fontWeight: 700, color: catColor }}>
              {form.amount ? `₹${form.amount}` : '₹0'} → {form.category}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {form.description || 'Enter description above'}
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}
          style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
          {submitting ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Saving...</> : '💾 Log Expense (+10 pts)'}
        </button>
      </form>

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}
          style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default ExpenseForm;
