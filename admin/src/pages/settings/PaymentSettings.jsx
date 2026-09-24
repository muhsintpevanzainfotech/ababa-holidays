import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Lock, 
  Save, 
  RefreshCw, 
  DollarSign, 
  Smartphone, 
  QrCode, 
  Building2, 
  HelpCircle,
  Zap,
  Info
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmDialogContext';
import FormSelect from '../../components/FormSelect';
import api from '../../utils/api';

const PaymentSettings = () => {
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  // Secret Visibility Toggles
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  // Form Settings State
  const [settings, setSettings] = useState({
    gateway: 'razorpay',
    environment: 'test',
    status: true,
    currency: 'INR',
    apiKey: '',
    apiSecret: '',
    apiSecretMasked: '',
    webhookSecret: '',
    webhookSecretMasked: '',
    methods: {
      card: true,
      upi: true,
      upiQr: true,
      netbanking: true
    }
  });

  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments/settings');
      if (res.data?.success && res.data.data) {
        setSettings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load payment settings:', err);
      showToast('Error', err.response?.data?.message || 'Failed to load payment settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEnvironmentToggle = async (newEnv) => {
    if (newEnv === 'live' && settings.environment === 'test') {
      const isConfirmed = await confirm(
        'Switch to Live Payment Mode?',
        'You are switching to Live Payment Mode. Real customer payments will be processed through Razorpay. Are you sure you want to activate Live Mode?'
      );
      if (!isConfirmed) return;
    }
    setSettings(prev => ({ ...prev, environment: newEnv }));
  };

  const handleMethodToggle = (methodKey) => {
    setSettings(prev => ({
      ...prev,
      methods: {
        ...prev.methods,
        [methodKey]: !prev.methods[methodKey]
      }
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();

    if (!settings.apiKey.trim()) {
      showToast('Validation Error', 'API Key is required to save gateway configuration.', 'error');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        environment: settings.environment,
        status: settings.status,
        currency: settings.currency,
        apiKey: settings.apiKey,
        apiSecret: settings.apiSecret,
        webhookSecret: settings.webhookSecret,
        methods: settings.methods
      };

      const res = await api.put('/payments/settings', payload);
      if (res.data?.success) {
        setSettings(res.data.data);
        showToast('Saved', 'Payment settings updated successfully.', 'success');
      }
    } catch (err) {
      showToast('Save Failed', err.response?.data?.message || 'Could not save payment settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      const res = await api.post('/payments/test-connection', {
        apiKey: settings.apiKey,
        apiSecret: settings.apiSecret
      });

      if (res.data?.success) {
        showToast('Connection Successful', res.data.message || 'Razorpay API credentials verified successfully!', 'success');
      }
    } catch (err) {
      showToast('Test Failed', err.response?.data?.message || 'Failed to authenticate with Razorpay API.', 'error');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="fade-in" style={{ padding: '40px', textAlign: 'center' }}>
        <RefreshCw size={32} className="spin-slow" style={{ color: 'var(--primary)', marginBottom: '16px' }} />
        <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Loading Payment Settings & Credentials...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* PAGE HEADER */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>Payment Settings</h1>
          <p>Configure Razorpay payment gateway credentials, modes, and customer checkout methods</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* TOP SUMMARY BAR */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px', background: 'var(--bg-card)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Gateway</div>
              <div style={{ fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Razorpay 
                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '10px', background: settings.status ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: settings.status ? '#16a34a' : '#dc2626', fontWeight: '800' }}>
                  ● {settings.status ? 'Connected' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: settings.environment === 'live' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)', color: settings.environment === 'live' ? '#16a34a' : '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Environment</div>
              <div style={{ fontSize: '14px', fontWeight: '800', textTransform: 'capitalize' }}>
                {settings.environment === 'live' ? '⚡ Live Mode' : '🧪 Test Mode'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Currency</div>
              <div style={{ fontSize: '14px', fontWeight: '800' }}>{settings.currency} (₹)</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Active Methods</div>
              <div style={{ fontSize: '12px', fontWeight: '800', display: 'flex', gap: '4px', marginTop: '2px' }}>
                <span style={{ color: settings.methods.card ? '#16a34a' : 'var(--text-muted)' }}>Card {settings.methods.card ? 'ON' : 'OFF'}</span> •
                <span style={{ color: settings.methods.upi ? '#16a34a' : 'var(--text-muted)' }}>UPI {settings.methods.upi ? 'ON' : 'OFF'}</span> •
                <span style={{ color: settings.methods.upiQr ? '#16a34a' : 'var(--text-muted)' }}>QR {settings.methods.upiQr ? 'ON' : 'OFF'}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* WARNING BANNER FOR TEST MODE */}
      {settings.environment === 'test' && (
        <div style={{ 
          background: 'rgba(234, 179, 8, 0.1)', 
          border: '1.5px solid rgba(234, 179, 8, 0.3)', 
          borderRadius: '12px', 
          padding: '16px 20px', 
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#854d0e'
        }}>
          <AlertTriangle size={24} style={{ color: '#ca8a04', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800' }}>Payments are currently running in Test Mode</h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
              No real money will be charged during checkout. Use Razorpay test card/UPI numbers to test booking flows.
            </p>
          </div>
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ fontSize: '12px', padding: '6px 12px', background: 'white', color: '#854d0e', border: '1px solid rgba(234, 179, 8, 0.4)' }}
            onClick={() => handleEnvironmentToggle('live')}
          >
            Switch to Live
          </button>
        </div>
      )}

      {/* SECTION 1: PAYMENT GATEWAY CONFIGURATION */}
      <div className="card" style={{ marginBottom: '32px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} style={{ color: 'var(--primary)' }} /> Payment Gateway Configuration
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Configure Razorpay API Keys and webhook authentication parameters</p>
          </div>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleTestConnection}
            disabled={testing}
            style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={testing ? 'spin-slow' : ''} /> {testing ? 'Testing...' : 'Test Connection'}
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '13px', fontWeight: '700' }}>Gateway Name</label>
              <input type="text" className="form-control" value="Razorpay" disabled style={{ fontWeight: '700', background: 'var(--bg-main)' }} />
            </div>

            <FormSelect 
              label="Gateway Status"
              options={[
                { value: 'active', label: 'Active (Enabled)' },
                { value: 'inactive', label: 'Inactive (Disabled)' }
              ]}
              value={settings.status ? 'active' : 'inactive'}
              onChange={(val) => setSettings({ ...settings, status: val === 'active' })}
            />

            <FormSelect 
              label="Environment Mode"
              options={[
                { value: 'test', label: 'Test Mode (Sandbox)' },
                { value: 'live', label: 'Live Mode (Production)' }
              ]}
              value={settings.environment}
              onChange={(val) => handleEnvironmentToggle(val)}
            />

          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '13px', fontWeight: '700' }}>API Key (Key ID)</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="rzp_test_..." 
                value={settings.apiKey} 
                onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '13px', fontWeight: '700', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>API Secret (Key Secret)</span>
                <span 
                  onClick={() => setShowApiSecret(!showApiSecret)} 
                  style={{ cursor: 'pointer', color: 'var(--primary)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {showApiSecret ? <EyeOff size={12} /> : <Eye size={12} />} {showApiSecret ? 'Hide' : 'Show'}
                </span>
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showApiSecret ? 'text' : 'password'} 
                  className="form-control" 
                  placeholder="Enter Razorpay Secret Key" 
                  value={showApiSecret ? (settings.apiSecret || '') : (settings.apiSecretMasked || settings.apiSecret || '')} 
                  onChange={(e) => setSettings({ ...settings, apiSecret: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '13px', fontWeight: '700', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Webhook Secret</span>
                <span 
                  onClick={() => setShowWebhookSecret(!showWebhookSecret)} 
                  style={{ cursor: 'pointer', color: 'var(--primary)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {showWebhookSecret ? <EyeOff size={12} /> : <Eye size={12} />} {showWebhookSecret ? 'Hide' : 'Show'}
                </span>
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showWebhookSecret ? 'text' : 'password'} 
                  className="form-control" 
                  placeholder="Enter Webhook Secret" 
                  value={showWebhookSecret ? (settings.webhookSecret || '') : (settings.webhookSecretMasked || settings.webhookSecret || '')} 
                  onChange={(e) => setSettings({ ...settings, webhookSecret: e.target.value })}
                />
              </div>
            </div>

          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'center' }}>
            <FormSelect 
              label="Settlement Currency"
              options={[
                { value: 'INR', label: 'INR (Indian Rupee - ₹)' },
                { value: 'USD', label: 'USD (US Dollar - $)' },
                { value: 'EUR', label: 'EUR (Euro - €)' }
              ]}
              value={settings.currency}
              onChange={(val) => setSettings({ ...settings, currency: val })}
            />
            
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--bg-main)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>🔒 Security Guarantee:</span> Sensitive credentials like Card Numbers, CVV, UPI PINs, banking passwords, and OTPs are never stored in your database or transmitted directly to frontend code.
            </div>
          </div>
        </form>
      </div>

      {/* SECTION 2: PAYMENT METHODS CONFIGURATION */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>Supported Customer Payment Methods</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          {/* METHOD 1: CARD */}
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: settings.methods.card ? '1.5px solid rgba(34, 197, 94, 0.4)' : '1px solid var(--border)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>Card Payment</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Credit and Debit Cards</span>
                  </div>
                </div>

                <label className="switch" style={{ cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={settings.methods.card} 
                    onChange={() => handleMethodToggle('card')} 
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                Accept major credit and debit cards securely through Razorpay 3D Secure authentication.
              </p>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>SUPPORTED CARDS:</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'var(--bg-main)', border: '1px solid var(--border)', fontWeight: '700' }}>Visa</span>
                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'var(--bg-main)', border: '1px solid var(--border)', fontWeight: '700' }}>Mastercard</span>
                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'var(--bg-main)', border: '1px solid var(--border)', fontWeight: '700' }}>RuPay</span>
                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'var(--bg-main)', border: '1px solid var(--border)', fontWeight: '700' }}>Amex</span>
              </div>
            </div>
          </div>

          {/* METHOD 2: UPI */}
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: settings.methods.upi ? '1.5px solid rgba(34, 197, 94, 0.4)' : '1px solid var(--border)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>UPI Instant</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pay using VPA or Apps</span>
                  </div>
                </div>

                <label className="switch" style={{ cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={settings.methods.upi} 
                    onChange={() => handleMethodToggle('upi')} 
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                Instant UPI payment via virtual payment addresses or direct mobile app checkout.
              </p>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>SUPPORTED APPS:</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'var(--bg-main)', border: '1px solid var(--border)', fontWeight: '700' }}>Google Pay</span>
                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'var(--bg-main)', border: '1px solid var(--border)', fontWeight: '700' }}>PhonePe</span>
                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'var(--bg-main)', border: '1px solid var(--border)', fontWeight: '700' }}>Paytm</span>
                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'var(--bg-main)', border: '1px solid var(--border)', fontWeight: '700' }}>BHIM</span>
              </div>
            </div>
          </div>

          {/* METHOD 3: UPI QR */}
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: settings.methods.upiQr ? '1.5px solid rgba(34, 197, 94, 0.4)' : '1px solid var(--border)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <QrCode size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>UPI Dynamic QR</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Scan & Pay on Desktop</span>
                  </div>
                </div>

                <label className="switch" style={{ cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={settings.methods.upiQr} 
                    onChange={() => handleMethodToggle('upiQr')} 
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                Generates a dynamic single-use QR code for desktop travelers to scan with any UPI camera app.
              </p>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>GATEWAY INTEGRATION:</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'var(--bg-main)', border: '1px solid var(--border)', fontWeight: '700' }}>Auto-Expiring QR</span>
                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'var(--bg-main)', border: '1px solid var(--border)', fontWeight: '700' }}>Zero Manual PIN Storage</span>
              </div>
            </div>
          </div>

          {/* METHOD 4: NET BANKING */}
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: settings.methods.netbanking ? '1.5px solid rgba(34, 197, 94, 0.4)' : '1px solid var(--border)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>Net Banking</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Direct Bank Transfer</span>
                  </div>
                </div>

                <label className="switch" style={{ cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={settings.methods.netbanking} 
                    onChange={() => handleMethodToggle('netbanking')} 
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                Support 50+ Indian retail and corporate banks directly via Razorpay portal checkout.
              </p>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>EXAMPLE BANKS:</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'var(--bg-main)', border: '1px solid var(--border)', fontWeight: '700' }}>SBI</span>
                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'var(--bg-main)', border: '1px solid var(--border)', fontWeight: '700' }}>HDFC</span>
                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'var(--bg-main)', border: '1px solid var(--border)', fontWeight: '700' }}>ICICI</span>
                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'var(--bg-main)', border: '1px solid var(--border)', fontWeight: '700' }}>Axis</span>
                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'var(--bg-main)', border: '1px solid var(--border)', fontWeight: '700' }}>+50 More</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;
