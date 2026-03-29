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
    <div className="glass-pane animate-up" style={{ padding: '24px', marginBottom: '100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
          Add <span className="text-gradient">Expense</span>
        </h2>
        <VoiceInput onResult={handleVoiceInput} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Amount */}
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>Amount</div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ember)', fontWeight: 800, fontSize: '1.2rem' }}>₹</span>
            <input
              type="number"
              className="input-flat"
              style={{ paddingLeft: '40px', fontSize: '1.5rem', fontWeight: 700 }}
              placeholder="0.00"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>Description</div>
            {aiResult && !categorizing && (
              <div style={{ color: 'var(--emerald)', fontSize: '0.7rem', fontWeight: 600 }}>
                🤖 AI: {aiResult.category}
              </div>
            )}
          </div>
          <input
            type="text"
            className="input-flat"
            placeholder="What was this for?"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            required
          />
        </div>

        {/* Category selector */}
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>Category</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <select
                className="input-flat"
                style={{ width: '100%', appearance: 'none', paddingRight: '40px' }}
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              >
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>
                    {categoryInfo[cat.name]?.emoji || '🏷️'} {cat.name}
                  </option>
                ))}
              </select>
              <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }}>▼</span>
            </div>
            <button
              type="button"
              className="btn-outline"
              onClick={() => setShowCustomCat(!showCustomCat)}
              style={{ padding: '0 16px', fontSize: '1.2rem' }}
            >
              +
            </button>
          </div>

          {showCustomCat && (
            <div className="animate-up" style={{ marginTop: '16px', background: 'rgba(255,140,0,0.05)', padding: '20px', borderRadius: '18px', border: '1px solid rgba(255,140,0,0.1)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '12px', color: 'var(--ember)' }}>New Category</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input 
                  type="text" className="input-flat" placeholder="Emoji" 
                  value={newCatEmoji} onChange={e => setNewCatEmoji(e.target.value)}
                  style={{ width: '60px', textAlign: 'center' }} 
                />
                <input 
                  type="text" className="input-flat" placeholder="Name" 
                  value={newCatName} onChange={e => setNewCatName(e.target.value)}
                  style={{ flex: 1 }} 
                />
              </div>
              <input 
                type="number" className="input-flat" placeholder="Monthly Budget (₹)" 
                value={newCatBudget} onChange={e => setNewCatBudget(e.target.value)}
                style={{ marginBottom: '12px' }} 
              />
              <button 
                type="button" className="btn-premium" 
                style={{ width: '100%', height: '44px', fontSize: '0.9rem' }}
                onClick={() => {
                  if (newCatName && newCatBudget) {
                    addCategory(newCatName.trim(), Number(newCatBudget), newCatEmoji);
                    setForm(f => ({ ...f, category: newCatName.trim() }));
                    setShowCustomCat(false);
                    setNewCatName('');
                    setNewCatBudget('');
                  } else {
                    showToast('Details required', 'error');
                  }
                }}
              >Create Category</button>
            </div>
          )}
        </div>

        {/* Date */}
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>Date</div>
          <input
            type="date"
            className="input-flat"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          />
        </div>

        <button type="submit" className="btn-premium" disabled={submitting} style={{ marginTop: '10px' }}>
          {submitting ? 'Saving...' : 'Log Transaction'}
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
