import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, FileText, Info, Save, User, UserCheck, RefreshCcw, Lock } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import PasskeyModal from '../components/PasskeyModal';

const Policies = () => {
  const { showToast } = useToast();
  const { isUnlocked, unlockedUntil } = useSelector((state) => state.global);
  const editorRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  
  // Selection state
  const [activeType, setActiveType] = useState('Terms & Conditions');
  const [activeTarget, setActiveTarget] = useState('User');

  // Input states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const fetchPolicy = async () => {
    setFetching(true);
    try {
      const response = await api.get('/policies', {
        params: {
          type: activeType,
          target: activeTarget,
          isGlobal: 'true'
        }
      });
      
      if (response.data.success && response.data.data.length > 0) {
        const policy = response.data.data[0];
        setTitle(policy.title);
        setContent(policy.content);
        if (editorRef.current) {
          editorRef.current.innerHTML = policy.content || '';
        }
      } else {
        setTitle(activeType);
        setContent('');
        if (editorRef.current) {
          editorRef.current.innerHTML = '';
        }
      }
    } catch (error) {
      showToast('Error', 'Failed to load policy', 'error');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, [activeType, activeTarget]);

  const handleSave = async (e) => {
    e?.preventDefault();

    // Check if session is still validly unlocked
    const isSessionValid = isUnlocked && unlockedUntil && new Date() < new Date(unlockedUntil);

    if (!isSessionValid) {
       setShowPasskeyModal(true);
       return;
    }

    const finalContent = editorRef.current ? editorRef.current.innerHTML : content;
    setLoading(true);
    try {
      const response = await api.post('/policies', {
        type: activeType,
        target: activeTarget,
        title,
        content: finalContent
      });
      
      if (response.data.success) {
        showToast('Success', 'Policy updated successfully', 'success');
      }
    } catch (error) {
      showToast('Error', error.response?.data?.message || 'Failed to save policy', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'Terms & Conditions', icon: <FileText size={18} /> },
    { id: 'Refund & Cancellation', icon: <RefreshCcw size={18} /> },
    { id: 'Privacy Policy', icon: <ShieldCheck size={18} /> }
  ];

  const targets = [
    { id: 'User', icon: <User size={18} />, label: 'For Website Users' },
    { id: 'Vendor', icon: <UserCheck size={18} />, label: 'For Travel Vendors' }
  ];

  return (
    <div className="fade-in">
      <div className="page-header" style={{ marginBottom: '40px' }}>
        <div>
          <h1>Platform Policies</h1>
          <p>Global Terms, Refund rules and Privacy guidelines for Users and Vendors</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        {/* Navigation Sidebar */}
        <div style={{ width: '300px', flexShrink: 0 }}>
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '1px' }}>Policy Type</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveType(tab.id)}
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    borderRadius: '12px',
                    background: activeType === tab.id ? 'var(--bg-main)' : 'transparent',
                    border: activeType === tab.id ? '1px solid var(--border)' : '1px solid transparent',
                    color: activeType === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: activeType === tab.id ? '700' : '600',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'var(--transition)'
                  }}
                >
                  {tab.icon} {tab.id}
                </button>
              ))}
            </div>

            <hr style={{ margin: '24px 0', border: 0, borderTop: '1px solid var(--border)' }} />

            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '1px' }}>Audience</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {targets.map(target => (
                <button
                  key={target.id}
                  onClick={() => setActiveTarget(target.id)}
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    borderRadius: '12px',
                    background: activeTarget === target.id ? 'var(--bg-main)' : 'transparent',
                    border: activeTarget === target.id ? '1px solid var(--border)' : '1px solid transparent',
                    color: activeTarget === target.id ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: activeTarget === target.id ? '700' : '600',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'var(--transition)'
                  }}
                >
                  {target.icon} {target.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '20px', background: 'rgba(79, 70, 229, 0.05)', borderRadius: '16px', border: '1px solid rgba(79, 70, 229, 0.1)' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={16} /> Pro Tip
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
              These policies will be displayed on the main website and vendor dashboard login/registration pages respectively.
            </p>
          </div>
        </div>

        {/* Editor Area */}
        <div style={{ flex: 1, minWidth: '400px' }}>
          <div className="card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
               <div>
                 <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>Edit {activeType}</h2>
                 <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Managing global content for {activeTarget === 'User' ? 'Website Users' : 'Travel Vendors'}</p>
               </div>
               <button 
                 onClick={handleSave} 
                 className="btn btn-primary" 
                 disabled={loading || fetching}
                 style={{ padding: '0 24px', height: '48px', fontWeight: '700', gap: '8px' }}
               >
                 {loading ? 'Saving...' : <><Save size={18} /> Update Policy</>}
               </button>
            </div>

            {fetching ? (
              <div style={{ padding: '100px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div className="loader" style={{ margin: '0 auto 16px' }}></div>
                <p>Loading document content...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="form-group">
                  <label>Document Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="Enter document title..."
                    style={{ fontWeight: '700', fontSize: '16px' }}
                  />
                </div>

                <div className="form-group">
                  <label>Policy Content</label>
                  <div className="editor-container" style={{ border: '1.5px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                    <div className="editor-toolbar" style={{ background: 'var(--bg-main)', padding: '8px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <button type="button" className="toolbar-btn" onClick={() => document.execCommand('bold', false)} title="Bold" style={{ width: '32px', height: '32px', border: 'none', background: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>B</button>
                      <button type="button" className="toolbar-btn" onClick={() => document.execCommand('italic', false)} title="Italic" style={{ width: '32px', height: '32px', border: 'none', background: 'white', borderRadius: '6px', cursor: 'pointer', fontStyle: 'italic' }}>I</button>
                      <button type="button" className="toolbar-btn" onClick={() => document.execCommand('underline', false)} title="Underline" style={{ width: '32px', height: '32px', border: 'none', background: 'white', borderRadius: '6px', cursor: 'pointer', textDecoration: 'underline' }}>U</button>
                      <div style={{ width: '1px', background: 'var(--border)', margin: '0 4px' }}></div>
                      <button type="button" className="toolbar-btn" onClick={() => document.execCommand('insertUnorderedList', false)} title="Bullet List" style={{ width: '32px', height: '32px', border: 'none', background: 'white', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                      </button>
                      <button type="button" className="toolbar-btn" onClick={() => document.execCommand('justifyLeft', false)} title="Align Left" style={{ width: '32px', height: '32px', border: 'none', background: 'white', borderRadius: '6px', cursor: 'pointer' }}>L</button>
                      <button type="button" className="toolbar-btn" onClick={() => document.execCommand('justifyCenter', false)} title="Align Center" style={{ width: '32px', height: '32px', border: 'none', background: 'white', borderRadius: '6px', cursor: 'pointer' }}>C</button>
                    </div>
                    <div 
                      ref={editorRef}
                      className="editor-content"
                      contentEditable
                      suppressContentEditableWarning={true}
                      onBlur={() => setContent(editorRef.current.innerHTML)}
                      style={{ 
                        minHeight: '400px', padding: '24px', outline: 'none', background: 'white',
                        fontSize: '15px', lineHeight: '1.8', fontFamily: 'Inter, sans-serif'
                      }}
                      placeholder="Provide detailed policy content here..."
                    />
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>Tip: Use the toolbar for essential formatting. Standard HTML tags are supported.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <PasskeyModal 
        isOpen={showPasskeyModal}
        onClose={() => setShowPasskeyModal(false)}
        onVerified={() => {
          setShowPasskeyModal(false);
          handleSave();
        }}
        title="Authorize Policy Update"
      />
    </div>
  );
};

export default Policies;
