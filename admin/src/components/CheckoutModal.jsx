import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  QrCode, 
  Building2, 
  ShieldCheck, 
  Lock, 
  X, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Zap
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

/**
 * Helper to dynamically inject Razorpay Checkout JS SDK script
 */
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CheckoutModal = ({ isOpen, onClose, booking, onPaymentSuccess }) => {
  const { showToast } = useToast();

  const [loadingConfig, setLoadingConfig] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [publicSettings, setPublicSettings] = useState({
    status: true,
    currency: 'INR',
    methods: { card: true, upi: true, upiQr: true, netbanking: true }
  });

  useEffect(() => {
    if (isOpen) {
      fetchPublicSettings();
    }
  }, [isOpen]);

  const fetchPublicSettings = async () => {
    try {
      setLoadingConfig(true);
      const res = await api.get('/payments/public-settings');
      if (res.data?.success && res.data.data) {
        setPublicSettings(res.data.data);
        // Pre-select first available method
        const m = res.data.data.methods;
        if (m.card) setSelectedMethod('card');
        else if (m.upi) setSelectedMethod('upi');
        else if (m.upiQr) setSelectedMethod('upiQr');
        else if (m.netbanking) setSelectedMethod('netbanking');
      }
    } catch (err) {
      console.error('Failed to load checkout settings:', err);
    } finally {
      setLoadingConfig(false);
    }
  };

  const handlePayNow = async () => {
    if (!booking || !booking._id) {
      showToast('Error', 'Invalid booking reference.', 'error');
      return;
    }

    try {
      setProcessing(true);

      // Load Razorpay Script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        showToast('Error', 'Failed to load Razorpay Payment Gateway. Check internet connection.', 'error');
        setProcessing(false);
        return;
      }

      // Step 1: Create Razorpay Order on Backend
      const orderRes = await api.post('/api/payments/create-order', {
        bookingId: booking._id,
        paymentMethod: selectedMethod
      });

      if (!orderRes.data?.success || !orderRes.data?.data) {
        showToast('Order Creation Failed', orderRes.data?.message || 'Could not initiate payment order.', 'error');
        setProcessing(false);
        return;
      }

      const { orderId, amount, currency, apiKey } = orderRes.data.data;

      // Step 2: Open Razorpay Checkout Options
      const options = {
        key: apiKey,
        amount: amount,
        currency: currency || 'INR',
        name: 'Ababa Travels',
        description: `Booking Payment for #${booking._id.slice(-8).toUpperCase()}`,
        image: '/logo.png',
        order_id: orderId,
        handler: async (response) => {
          try {
            // Step 3: Server-side Signature Verification
            const verifyRes = await api.post('/api/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentMethod: selectedMethod
            });

            if (verifyRes.data?.success) {
              showToast('Payment Successful', 'Your booking is confirmed! Payment verified.', 'success');
              if (onPaymentSuccess) onPaymentSuccess(verifyRes.data.data);
              onClose();
            } else {
              showToast('Verification Failed', verifyRes.data?.message || 'Payment signature verification failed.', 'error');
            }
          } catch (verifyErr) {
            showToast('Verification Error', verifyErr.response?.data?.message || 'Failed to verify payment.', 'error');
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: booking.customerName || booking.user?.name || '',
          email: booking.customerEmail || booking.user?.email || '',
          contact: booking.customerPhone || booking.user?.phone || ''
        },
        theme: {
          color: '#3b82f6'
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            showToast('Payment Cancelled', 'You closed the Razorpay payment window.', 'info');
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      console.error('Checkout error:', err);
      showToast('Payment Error', err.response?.data?.message || 'Failed to initialize checkout.', 'error');
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '20px'
    }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: '520px', padding: '28px', borderRadius: '20px', position: 'relative' }}>
        
        {/* CLOSE BUTTON */}
        <button 
          onClick={onClose} 
          disabled={processing}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        {/* MODAL HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Select Payment Method</h3>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Secure Razorpay 256-Bit Encrypted Checkout</p>
          </div>
        </div>

        {/* BOOKING SUMMARY BOX */}
        {booking && (
          <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '14px', marginBottom: '24px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>Booking Reference:</span>
              <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)' }}>#{booking._id?.slice(-8).toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '700' }}>Total Payable Amount:</span>
              <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)' }}>₹{(booking.totalPrice || booking.amount || 0).toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* PAYMENT METHOD CARDS */}
        {loadingConfig ? (
          <div style={{ padding: '30px', textAlign: 'center' }}>
            <RefreshCw size={24} className="spin-slow" style={{ color: 'var(--primary)', marginBottom: '8px' }} />
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Fetching enabled payment gateways...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
            
            {/* OPTION 1: CARD */}
            {publicSettings.methods.card && (
              <div 
                onClick={() => setSelectedMethod('card')}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                  border: selectedMethod === 'card' ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: selectedMethod === 'card' ? 'rgba(var(--primary-rgb), 0.05)' : 'var(--bg-main)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CreditCard size={20} style={{ color: selectedMethod === 'card' ? 'var(--primary)' : 'var(--text-muted)' }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '800' }}>Credit / Debit Card</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Visa, Mastercard, RuPay, Amex</div>
                  </div>
                </div>
                <input type="radio" checked={selectedMethod === 'card'} onChange={() => setSelectedMethod('card')} />
              </div>
            )}

            {/* OPTION 2: UPI */}
            {publicSettings.methods.upi && (
              <div 
                onClick={() => setSelectedMethod('upi')}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                  border: selectedMethod === 'upi' ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: selectedMethod === 'upi' ? 'rgba(var(--primary-rgb), 0.05)' : 'var(--bg-main)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Smartphone size={20} style={{ color: selectedMethod === 'upi' ? 'var(--primary)' : 'var(--text-muted)' }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '800' }}>UPI Instant</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Google Pay, PhonePe, Paytm, BHIM</div>
                  </div>
                </div>
                <input type="radio" checked={selectedMethod === 'upi'} onChange={() => setSelectedMethod('upi')} />
              </div>
            )}

            {/* OPTION 3: UPI QR */}
            {publicSettings.methods.upiQr && (
              <div 
                onClick={() => setSelectedMethod('upiQr')}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                  border: selectedMethod === 'upiQr' ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: selectedMethod === 'upiQr' ? 'rgba(var(--primary-rgb), 0.05)' : 'var(--bg-main)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <QrCode size={20} style={{ color: selectedMethod === 'upiQr' ? 'var(--primary)' : 'var(--text-muted)' }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '800' }}>UPI Dynamic QR</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Scan & Pay from any camera app</div>
                  </div>
                </div>
                <input type="radio" checked={selectedMethod === 'upiQr'} onChange={() => setSelectedMethod('upiQr')} />
              </div>
            )}

            {/* OPTION 4: NET BANKING */}
            {publicSettings.methods.netbanking && (
              <div 
                onClick={() => setSelectedMethod('netbanking')}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                  border: selectedMethod === 'netbanking' ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: selectedMethod === 'netbanking' ? 'rgba(var(--primary-rgb), 0.05)' : 'var(--bg-main)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Building2 size={20} style={{ color: selectedMethod === 'netbanking' ? 'var(--primary)' : 'var(--text-muted)' }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '800' }}>Net Banking</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SBI, HDFC, ICICI, Axis + 50 Banks</div>
                  </div>
                </div>
                <input type="radio" checked={selectedMethod === 'netbanking'} onChange={() => setSelectedMethod('netbanking')} />
              </div>
            )}

          </div>
        )}

        {/* PAY BUTTON */}
        <button 
          onClick={handlePayNow}
          disabled={processing || loadingConfig}
          className="btn btn-primary"
          style={{ width: '100%', height: '48px', fontSize: '15px', fontWeight: '800', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
        >
          {processing ? (
            <>
              <RefreshCw size={18} className="spin-slow" /> Verifying & Processing...
            </>
          ) : (
            <>
              <Lock size={16} /> Pay ₹{(booking?.totalPrice || booking?.amount || 0).toLocaleString()} via Razorpay
            </>
          )}
        </button>

        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <Lock size={12} /> No card numbers, CVVs, or passwords are saved on our servers.
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
