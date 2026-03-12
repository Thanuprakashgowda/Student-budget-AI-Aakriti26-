import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCategories } from '../hooks/useCategories';

const BudgetSetup = () => {
  const { user, completeBudgetSetup } = useAuth();
  const { categories, addCategory, updateBudget } = useCategories(user?._id);
  
  const [step, setStep] = useState(1);
  const [globalBudget, setGlobalBudget] = useState('');
  
  // Custom category form
  const [newCat, setNewCat] = useState({ name: '', budget: '', emoji: '🏷️' });
  const [isAdding, setIsAdding] = useState(false);

  const handleNext = () => {
    if (step === 1 && !globalBudget) return;
    setStep(2);
  };

  const handleAddCategory = () => {
    if (!newCat.name || !newCat.budget) return;
    addCategory(newCat.name.trim(), Number(newCat.budget), newCat.emoji);
    setNewCat({ name: '', budget: '', emoji: '🏷️' });
    setIsAdding(false);
  };

  const handleFinish = () => {
    // Save total budget to local storage (for now)
    localStorage.setItem(`sba_total_budget_${user?._id}`, globalBudget);
    completeBudgetSetup(user?._id);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', top: '10%', right: '15%', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(255,140,0,0.1) 0%, transparent 70%)',
        pointerEvents: 'none', borderRadius: '50%' }} />

      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: 540, padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: 64, height: 64, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #FF8C00, #FF4500)',
            borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', boxShadow: '0 8px 32px rgba(255,140,0,0.3)'
          }}>🎯</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Welcome, {user?.name?.split(' ')[0] || 'Student'}!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Let's set up your monthly budget to get started.
          </p>
        </div>

        {/* Steps Progress */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: step >= 1 ? 'var(--amber)' : 'rgba(255,255,255,0.1)' }} />
          <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: step >= 2 ? 'var(--amber)' : 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* STEP 1: Total Budget */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>What is your total monthly budget?</h3>
            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', color: 'var(--text-muted)' }}>₹</span>
              <input
                type="number"
                className="form-input"
                style={{ fontSize: '1.5rem', paddingLeft: '40px', paddingtop: '16px', paddingBottom: '16px' }}
                placeholder="e.g. 10000"
                value={globalBudget}
                onChange={(e) => setGlobalBudget(e.target.value)}
                autoFocus
              />
            </div>
            
            <button 
              className="btn btn-primary" 
              onClick={handleNext}
              disabled={!globalBudget}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}
            >
              Continue ➔
            </button>
          </div>
        )}

        {/* STEP 2: Categories */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Review your categories</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              We've created standard categories for you. You can adjust their budgets or add custom ones.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
              {categories.map(cat => (
                <div key={cat.name} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', 
                  background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '12px',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ 
                    width: 40, height: 40, borderRadius: '10px', 
                    background: `${cat.color}22`, color: cat.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
                  }}>
                    {cat.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{cat.name}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>₹</span>
                    <input 
                      type="number" 
                      className="form-input" 
                      style={{ width: '90px', padding: '6px 10px', fontSize: '0.9rem' }}
                      value={cat.budget}
                      onChange={(e) => updateBudget(cat.name, Number(e.target.value))}
                    />
                  </div>
                </div>
              ))}

              {/* Add Custom Category Form */}
              {isAdding ? (
                <div style={{ background: 'rgba(255,140,0,0.06)', padding: '16px', borderRadius: '12px', border: '1px dashed var(--amber)' }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                    <input 
                      type="text" className="form-input" placeholder="Emoji (e.g. 🏋️)" 
                      value={newCat.emoji} onChange={e => setNewCat({...newCat, emoji: e.target.value})}
                      style={{ width: '70px', textAlign: 'center' }} 
                    />
                    <input 
                      type="text" className="form-input" placeholder="Category Name" 
                      value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})}
                      style={{ flex: 1 }} autoFocus
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Budget: ₹</span>
                    <input 
                      type="number" className="form-input" placeholder="Amount" 
                      value={newCat.budget} onChange={e => setNewCat({...newCat, budget: e.target.value})}
                      style={{ flex: 1 }} 
                    />
                    <button className="btn btn-success" onClick={handleAddCategory} style={{ padding: '8px 16px' }}>Add</button>
                    <button className="btn btn-ghost" onClick={() => setIsAdding(false)} style={{ padding: '8px 12px' }}>✕</button>
                  </div>
                </div>
              ) : (
                <button 
                  className="btn btn-ghost" 
                  onClick={() => setIsAdding(true)}
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', borderStyle: 'dashed' }}
                >
                  + Add Custom Category
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
              <button 
                className="btn btn-primary" 
                onClick={handleFinish}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Let's Go 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetSetup;
