import React, { useState, useRef, useEffect } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { useCategories } from '../hooks/useCategories';
import { useAuth } from '../context/AuthContext';

const Chatbot = () => {
  const { user } = useAuth();
  const { expenses } = useExpenses();
  const { CATEGORY_BUDGETS } = useCategories(user?._id);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    if (user?._id) {
      const saved = localStorage.getItem(`sba_chat_${user._id}`);
      if (saved) return JSON.parse(saved);
    }
    return [{ role: 'ai', text: `Hi ${user?.name?.split(' ')[0] || 'there'}! I'm StudentBudgetAI. Ask me anything about your spending or budget!` }];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Persist messages whenever they change
  useEffect(() => {
    if (user?._id && messages.length > 0) {
      localStorage.setItem(`sba_chat_${user._id}`, JSON.stringify(messages));
    }
  }, [messages, user?._id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          expenses: expenses,
          budgets: CATEGORY_BUDGETS
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: data.message || 'Sorry, I encountered an error.' }]);
      }
    } catch (error) {
      console.error('Chat processing error:', error);
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I cannot reach the server right now.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '108px', right: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px' }}>
      {isOpen && (
        <div className="glass-pane animate-up" style={{ width: 'calc(100vw - 40px)', maxWidth: '360px', height: '500px', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid rgba(255,140,0,0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}>
          {/* Header */}
          <div style={{ padding: '16px', background: 'rgba(255,140,0,0.08)', borderBottom: '1px solid rgba(255,140,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--ember), var(--fire))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                🤖
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>Budget AI</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Financial Advisor</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => {
                  if (window.confirm("Clear chat?")) {
                    setMessages([{ role: 'ai', text: `Hi ${user?.name?.split(' ')[0] || 'there'}! I'm StudentBudgetAI. Ask me anything!` }]);
                    if (user?._id) localStorage.removeItem(`sba_chat_${user._id}`);
                  }
                }} 
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '1rem' }}
              >🗑️</button>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem', fontWeight: 800 }}>✕</button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div style={{
                  padding: '12px 16px', borderRadius: '18px', fontSize: '0.9rem', lineHeight: '1.5',
                  background: m.role === 'user' ? 'var(--ember)' : 'rgba(255,255,255,0.04)',
                  color: m.role === 'user' ? '#000' : '#fff',
                  borderBottomRightRadius: m.role === 'user' ? '4px' : '18px',
                  borderBottomLeftRadius: m.role === 'ai' ? '4px' : '18px',
                  border: m.role === 'ai' ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.04)', padding: '12px 16px', borderRadius: '18px', borderBottomLeftRadius: '4px' }}>
                <div className="spinner" style={{ width: '16px', height: '16px' }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="input-flat"
              style={{ borderRadius: '50px', padding: '12px 20px', fontSize: '0.9rem' }}
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit" 
              className="btn-premium" 
              style={{ padding: 0, width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0 }} 
              disabled={loading || !input.trim()}
            >➔</button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--ember), var(--fire))',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', boxShadow: '0 10px 30px rgba(255,140,0,0.4)',
            transition: 'var(--transition)'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1) translateY(-5px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
        >
          ✨
        </button>
      )}
    </div>
  );
};

export default Chatbot;
