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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* Background orbs (Enhanced) */}
      <div style={{ position: 'fixed', top: '-5%', right: '-5%', width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(255,140,0,0.12) 0%, transparent 70%)',
        pointerEvents: 'none', borderRadius: '50%', filter: 'blur(40px)' }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 60%)',
        pointerEvents: 'none', borderRadius: '50%', filter: 'blur(30px)' }} />

      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: 540, padding: '48px 32px', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: 72, height: 72, margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #FF8C00, #FF4500)',
            borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.2rem', boxShadow: '0 12px 40px rgba(255,140,0,0.4)',
            animation: 'float 4s ease-in-out infinite'
          }}>🎯</div>
          <h1 className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
            {step === 1 ? "Welcome to SBAI!" : "Almost There!"}
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', fontWeight: 500 }}>
            {step === 1 
              ? `Hello ${user?.name?.split(' ')[0] || 'Student'}, let's set your budget.` 
              : "Review and customize your spending categories."}
          </p>
        </div>

        {/* Steps Progress */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: step >= 1 ? 'var(--ember)' : 'rgba(255,255,255,0.08)', transition: '0.3s' }} />
          <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: step >= 2 ? 'var(--ember)' : 'rgba(255,255,255,0.08)', transition: '0.3s' }} />
        </div>

        {/* STEP 1: Total Budget */}
        {step === 1 && (
          <div className="animate-fade-in">
            <label className="form-label" style={{ marginBottom: '16px', fontSize: '0.9rem' }}>Monthly Budget Limit (₹)</label>
            <div style={{ position: 'relative', marginBottom: '28px' }}>
              <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--ember)', opacity: 0.8 }}>₹</span>
              <input
                type="number"
                className="form-input"
                style={{ fontSize: '2rem', paddingLeft: '56px', height: '80px', fontWeight: 800 }}
                placeholder="0"
                value={globalBudget}
                onChange={(e) => setGlobalBudget(e.target.value)}
                autoFocus
              />
            </div>
            
            <button 
              className="btn-primary" 
              onClick={handleNext}
              disabled={!globalBudget}
              style={{ width: '100%', height: '56px', fontSize: '1.1rem' }}
            >
              Continue Setup ➔
            </button>
          </div>
        )}

        {/* STEP 2: Categories */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
              {categories.map(cat => (
                <div key={cat.name} style={{
                  display: 'flex', alignItems: 'center', gap: '14px', 
                  background: 'rgba(255,255,255,0.02)', padding: '14px 18px', borderRadius: '18px',
                  border: '1px solid rgba(255,255,255,0.04)'
                }}>
                  <div style={{ 
                    width: 44, height: 44, borderRadius: '14px', 
                    background: `${cat.color}15`, color: cat.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem'
                  }}>
                    {cat.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{cat.name}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--text-dim)', fontWeight: 700 }}>₹</span>
                    <input 
                      type="number" 
                      className="form-input" 
                      style={{ width: '100px', padding: '10px', fontSize: '1rem', fontWeight: 700, textAlign: 'right' }}
                      value={cat.budget}
                      onChange={(e) => updateBudget(cat.name, Number(e.target.value))}
                    />
                  </div>
                </div>
              ))}

              {/* Add Custom Category Form */}
              {isAdding ? (
                <div className="animate-fade-in" style={{ background: 'rgba(255,140,0,0.05)', padding: '20px', borderRadius: '20px', border: '1px dashed rgba(255,140,0,0.2)' }}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                    <input 
                      type="text" className="form-input" placeholder="Emoji" 
                      value={newCat.emoji} onChange={e => setNewCat({...newCat, emoji: e.target.value})}
                      style={{ width: '70px', textAlign: 'center', fontSize: '1.5rem' }} 
                    />
                    <input 
                      type="text" className="form-input" placeholder="Category Name" 
                      value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})}
                      style={{ flex: 1, fontWeight: 600 }} autoFocus
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input 
                      type="number" className="form-input" placeholder="Budget (₹)" 
                      value={newCat.budget} onChange={e => setNewCat({...newCat, budget: e.target.value})}
                      style={{ flex: 1, fontWeight: 700 }} 
                    />
                    <button className="btn-primary" onClick={handleAddCategory} style={{ padding: '0 20px', height: '48px' }}>Add</button>
                    <button className="btn-ghost" onClick={() => setIsAdding(false)} style={{ padding: '0 14px', height: '48px', minWidth: '48px' }}>✕</button>
                  </div>
                </div>
              ) : (
                <button 
                  className="btn-ghost" 
                  onClick={() => setIsAdding(true)}
                  style={{ width: '100%', justifyContent: 'center', height: '54px', borderStyle: 'dashed', background: 'transparent' }}
                >
                  + Add Custom Category
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '14px' }}>
              <button className="btn-ghost" onClick={() => setStep(1)} style={{ width: '100px' }}>Back</button>
              <button 
                className="btn-primary" 
                onClick={handleFinish}
                style={{ flex: 1 }}
              >
                Let's Go! 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetSetup;
