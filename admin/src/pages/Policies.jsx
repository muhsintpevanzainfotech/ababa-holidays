import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, FileText, Info, Save, User, UserCheck, RefreshCcw, Eye, Edit3, RotateCcw, Sparkles } from 'lucide-react';
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
  const [mode, setMode] = useState('edit'); // 'edit' or 'preview'

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
        setTitle(policy.title || activeType);
        setContent(policy.content || '');
      } else {
        setTitle(`${activeTarget === 'User' ? 'Customer' : 'Partner Vendor'} ${activeType}`);
        setContent('');
      }
    } catch (error) {
      showToast('Error', 'Failed to load policy document', 'error');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, [activeType, activeTarget]);

  // Sync editor innerHTML whenever content or fetching state updates
  useEffect(() => {
    if (!fetching && editorRef.current) {
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content || '';
      }
    }
  }, [fetching, content, mode]);

  const handleSave = async (e) => {
    e?.preventDefault();

    // Check if session is validly unlocked
    const isSessionValid = isUnlocked && unlockedUntil && new Date() < new Date(unlockedUntil);

    if (!isSessionValid) {
      setShowPasskeyModal(true);
      return;
    }

    const finalContent = editorRef.current ? editorRef.current.innerHTML : content;
    if (!title.trim() || !finalContent || finalContent === '<br>') {
      showToast('Validation Error', 'Document title and content cannot be empty', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/policies', {
        type: activeType,
        target: activeTarget,
        title,
        content: finalContent
      });

      if (response.data.success) {
        setContent(finalContent);
        showToast('Success', 'Policy document updated successfully', 'success');
      }
    } catch (error) {
      showToast('Error', error.response?.data?.message || 'Failed to save policy', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExecCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
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
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1>Platform Policies</h1>
          <p>Manage legal guidelines, terms of service, refund rules, and privacy documentation for travelers and partner vendors.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        {/* Navigation Sidebar */}
        <div style={{ width: '300px', flexShrink: 0 }}>
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '1px', fontWeight: '800' }}>
              Policy Category
            </h3>
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
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab.icon} {tab.id}
                </button>
              ))}
            </div>

            <hr style={{ margin: '24px 0', border: 0, borderTop: '1px solid var(--border)' }} />

            <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '1px', fontWeight: '800' }}>
              Target Audience
            </h3>
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
                    transition: 'all 0.2s ease'
                  }}
                >
                  {target.icon} {target.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '20px', background: 'rgba(var(--primary-rgb, 99, 102, 241), 0.05)', borderRadius: '16px', border: '1px solid rgba(var(--primary-rgb, 99, 102, 241), 0.15)' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={16} /> Platform Context
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
              Policies for <strong>{activeTarget === 'User' ? 'Website Users' : 'Travel Vendors'}</strong> govern customer bookings, vendor onboarding, payments, and safety compliance across the platform.
            </p>
          </div>
        </div>

        {/* Main Editor & Live Preview Container */}
        <div style={{ flex: 1, minWidth: '400px' }}>
          <div className="card" style={{ padding: '32px' }}>
            {/* Header controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {activeType}
                  <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '20px', background: activeTarget === 'User' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: activeTarget === 'User' ? '#2563eb' : '#d97706', fontWeight: '700' }}>
                    {activeTarget === 'User' ? 'Customer Facing' : 'Vendor Facing'}
                  </span>
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                  Editing global document for {activeTarget === 'User' ? 'Travelers & Website Visitors' : 'Registered Travel Vendors'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {/* View toggle */}
                <div style={{ display: 'flex', background: 'var(--bg-main)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <button
                    type="button"
                    onClick={() => setMode('edit')}
                    style={{
                      padding: '8px 14px', borderRadius: '8px', border: 'none',
                      background: mode === 'edit' ? 'var(--bg-card)' : 'transparent',
                      color: mode === 'edit' ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <Edit3 size={15} /> Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('preview')}
                    style={{
                      padding: '8px 14px', borderRadius: '8px', border: 'none',
                      background: mode === 'preview' ? 'var(--bg-card)' : 'transparent',
                      color: mode === 'preview' ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <Eye size={15} /> Live Preview
                  </button>
                </div>

                <button
                  onClick={handleSave}
                  className="btn btn-primary"
                  disabled={loading || fetching}
                  style={{ padding: '0 24px', height: '44px', fontWeight: '700', gap: '8px' }}
                >
                  {loading ? 'Saving...' : <><Save size={18} /> Save Policy</>}
                </button>
              </div>
            </div>

            {fetching ? (
              <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div className="loader" style={{ margin: '0 auto 16px' }}></div>
                <p style={{ fontWeight: '600' }}>Fetching policy document from database...</p>
              </div>
            ) : mode === 'preview' ? (
              <div className="fade-in" style={{ padding: '24px', background: 'var(--bg-main)', borderRadius: '16px', border: '1px solid var(--border)', minHeight: '450px' }}>
                <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                  <h1 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '8px' }}>{title || activeType}</h1>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ababa Travels Official Policy Document</span>
                </div>
                <div
                  className="policy-rendered-content"
                  dangerouslySetInnerHTML={{ __html: content || '<p style="color: var(--text-muted); font-style: italic;">No policy content provided yet.</p>' }}
                  style={{ fontSize: '15px', lineHeight: '1.8', color: 'var(--text-main)' }}
                />
              </div>
            ) : (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group">
                  <label style={{ fontWeight: '700', fontSize: '14px', marginBottom: '8px', display: 'block' }}>Document Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter policy document title..."
                    style={{ fontWeight: '700', fontSize: '16px', borderRadius: '10px' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: '700', fontSize: '14px', marginBottom: '8px', display: 'block' }}>Policy Content</label>
                  <div className="editor-container" style={{ border: '1.5px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                    <div className="editor-toolbar" style={{ background: 'var(--bg-main)', padding: '10px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button type="button" onClick={() => handleExecCommand('bold')} title="Bold" style={toolbarBtnStyle}><b>B</b></button>
                      <button type="button" onClick={() => handleExecCommand('italic')} title="Italic" style={{ ...toolbarBtnStyle, fontStyle: 'italic' }}>I</button>
                      <button type="button" onClick={() => handleExecCommand('underline')} title="Underline" style={{ ...toolbarBtnStyle, textDecoration: 'underline' }}>U</button>
                      
                      <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 4px' }}></div>
                      
                      <button type="button" onClick={() => handleExecCommand('formatBlock', '<h3>')} title="Heading 3" style={toolbarBtnStyle}>H3</button>
                      <button type="button" onClick={() => handleExecCommand('formatBlock', '<p>')} title="Paragraph" style={toolbarBtnStyle}>P</button>
                      <button type="button" onClick={() => handleExecCommand('insertUnorderedList')} title="Bullet List" style={toolbarBtnStyle}>• List</button>
                      <button type="button" onClick={() => handleExecCommand('insertOrderedList')} title="Numbered List" style={toolbarBtnStyle}>1. List</button>
                      
                      <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 4px' }}></div>
                      
                      <button type="button" onClick={() => handleExecCommand('justifyLeft')} title="Align Left" style={toolbarBtnStyle}>Left</button>
                      <button type="button" onClick={() => handleExecCommand('justifyCenter')} title="Align Center" style={toolbarBtnStyle}>Center</button>
                      <button type="button" onClick={() => handleExecCommand('removeFormat')} title="Clear Formatting" style={toolbarBtnStyle}>Clear</button>
                    </div>

                    <div
                      ref={editorRef}
                      className="editor-content"
                      contentEditable
                      suppressContentEditableWarning={true}
                      onInput={() => {
                        if (editorRef.current) setContent(editorRef.current.innerHTML);
                      }}
                      onBlur={() => {
                        if (editorRef.current) setContent(editorRef.current.innerHTML);
                      }}
                      style={{
                        minHeight: '400px', padding: '24px', outline: 'none', background: 'var(--bg-card)', color: 'var(--text-main)',
                        fontSize: '15px', lineHeight: '1.8', fontFamily: 'Inter, sans-serif'
                      }}
                    />
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                    Tip: Formatted HTML with headings (H3), bold text, bullet lists, and numbered points will render cleanly across all web and mobile views.
                  </p>
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

const toolbarBtnStyle = {
  padding: '6px 12px',
  border: '1px solid var(--border)',
  background: 'var(--bg-card)',
  color: 'var(--text-main)',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '600',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.2s ease'
};

export default Policies;
