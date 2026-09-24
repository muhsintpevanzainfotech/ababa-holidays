import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellOff, 
  ShieldCheck, 
  ShieldAlert, 
  Sliders,
  Globe,
  Share2,
  ExternalLink,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  RefreshCw,
  MessageCircle,
  Video,
  Send,
  Camera,
  AtSign,
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  Headphones,
  AlertTriangle,
  LifeBuoy,
  Calendar,
  Building
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useUI } from '../../context/UIContext';
import api from '../../utils/api';

const defaultSocialLinks = {
  facebook: 'https://facebook.com/ababatravels',
  instagram: 'https://instagram.com/ababatravels',
  twitter: 'https://twitter.com/ababatravels',
  youtube: 'https://youtube.com/@ababatravels',
  linkedin: 'https://linkedin.com/company/ababatravels',
  whatsapp: 'https://wa.me/919876543210',
  pinterest: 'https://pinterest.com/ababatravels',
  telegram: 'https://t.me/ababatravels',
  customLinks: []
};

const defaultContactDetails = {
  primaryPhone: '+91 98765 43210',
  supportPhone: '+91 98765 43211',
  emergencyPhone: '+91 99887 76655',
  primaryEmail: 'info@ababatravels.com',
  supportEmail: 'support@ababatravels.com',
  bookingEmail: 'bookings@ababatravels.com',
  address: 'Ababa Travels Command Center, MG Road, Fort Kochi, Kerala 682001, India',
  workingHours: 'Mon - Sat: 9:00 AM - 8:00 PM IST',
  customContacts: []
};

const socialPlatformsConfig = [
  { key: 'facebook', label: 'Facebook Page URL', icon: <Globe size={18} />, color: '#1877F2', bg: 'rgba(24, 119, 242, 0.1)', placeholder: 'https://facebook.com/yourbrand' },
  { key: 'instagram', label: 'Instagram Profile URL', icon: <Camera size={18} />, color: '#E4405F', bg: 'rgba(228, 64, 95, 0.1)', placeholder: 'https://instagram.com/yourbrand' },
  { key: 'twitter', label: 'X (Twitter) Profile URL', icon: <AtSign size={18} />, color: '#000000', bg: 'rgba(0, 0, 0, 0.08)', placeholder: 'https://x.com/yourbrand' },
  { key: 'youtube', label: 'YouTube Channel URL', icon: <Video size={18} />, color: '#FF0000', bg: 'rgba(255, 0, 0, 0.1)', placeholder: 'https://youtube.com/@yourchannel' },
  { key: 'linkedin', label: 'LinkedIn Company URL', icon: <Share2 size={18} />, color: '#0A66C2', bg: 'rgba(10, 102, 194, 0.1)', placeholder: 'https://linkedin.com/company/yourbrand' },
  { key: 'whatsapp', label: 'WhatsApp Support / Link', icon: <MessageCircle size={18} />, color: '#25D366', bg: 'rgba(37, 211, 102, 0.1)', placeholder: 'https://wa.me/919876543210' },
  { key: 'pinterest', label: 'Pinterest Account URL', icon: <Globe size={18} />, color: '#E60023', bg: 'rgba(230, 0, 35, 0.1)', placeholder: 'https://pinterest.com/yourbrand' },
  { key: 'telegram', label: 'Telegram Channel / Group', icon: <Send size={18} />, color: '#229ED9', bg: 'rgba(34, 158, 217, 0.1)', placeholder: 'https://t.me/yourbrand' }
];

const GeneralSettings = () => {
  const { isNotificationsEnabled, toggleNotifications } = useUI();
  const { showToast } = useToast();

  const [isPasskeyEnabled, setIsPasskeyEnabled] = useState(true);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  // Social Links State
  const [socialLinks, setSocialLinks] = useState(defaultSocialLinks);
  const [socialsLoading, setSocialsLoading] = useState(false);
  const [socialsSaving, setSocialsSaving] = useState(false);
  const [newCustomTitle, setNewCustomTitle] = useState('');
  const [newCustomUrl, setNewCustomUrl] = useState('');

  // Contact & Support Information State
  const [contactDetails, setContactDetails] = useState(defaultContactDetails);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsSaving, setContactsSaving] = useState(false);
  const [newCustomContactLabel, setNewCustomContactLabel] = useState('');
  const [newCustomContactVal, setNewCustomContactVal] = useState('');

  useEffect(() => {
    fetchPasskeyStatus();
    fetchSocialLinks();
    fetchContactDetails();
  }, []);

  const fetchPasskeyStatus = async () => {
    try {
      const response = await api.get('/settings/passkey-status');
      if (response.data?.success) {
        setIsPasskeyEnabled(response.data.enabled);
      }
    } catch (err) {
      console.error('Error fetching passkey status:', err);
    }
  };

  const fetchSocialLinks = async () => {
    setSocialsLoading(true);
    try {
      const response = await api.get('/settings/social-links');
      if (response.data?.success && response.data.socialLinks) {
        setSocialLinks({
          ...defaultSocialLinks,
          ...response.data.socialLinks
        });
      }
    } catch (err) {
      console.error('Error fetching system social media links:', err);
    } finally {
      setSocialsLoading(false);
    }
  };

  const fetchContactDetails = async () => {
    setContactsLoading(true);
    try {
      const response = await api.get('/settings/contact-details');
      if (response.data?.success && response.data.contactDetails) {
        setContactDetails({
          ...defaultContactDetails,
          ...response.data.contactDetails
        });
      }
    } catch (err) {
      console.error('Error fetching system contact details:', err);
    } finally {
      setContactsLoading(false);
    }
  };

  const handleTogglePasskey = async () => {
    setPasskeyLoading(true);
    try {
      const nextState = !isPasskeyEnabled;
      const response = await api.post('/settings/toggle-passkey', { enabled: nextState });
      setIsPasskeyEnabled(response.data.enabled);
      showToast(
        'Passkey Requirement Updated',
        `Administrative Passkey authorization is now turned ${response.data.enabled ? 'ON' : 'OFF'}.`,
        'success'
      );
    } catch (error) {
      showToast('Error', error.response?.data?.message || 'Failed to update passkey setting', 'error');
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handleSocialInputChange = (key, value) => {
    setSocialLinks(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleContactInputChange = (key, value) => {
    setContactDetails(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddCustomLink = () => {
    if (!newCustomTitle.trim() || !newCustomUrl.trim()) {
      showToast('Validation Error', 'Please fill in both custom platform title and link URL.', 'error');
      return;
    }
    const newLink = {
      id: Date.now().toString(),
      title: newCustomTitle.trim(),
      url: newCustomUrl.trim()
    };

    setSocialLinks(prev => ({
      ...prev,
      customLinks: [...(prev.customLinks || []), newLink]
    }));

    setNewCustomTitle('');
    setNewCustomUrl('');
    showToast('Custom Link Added', `Added ${newCustomTitle} to custom links list. Save changes to finalize.`, 'info');
  };

  const handleRemoveCustomLink = (id) => {
    setSocialLinks(prev => ({
      ...prev,
      customLinks: (prev.customLinks || []).filter(item => item.id !== id)
    }));
  };

  const handleAddCustomContact = () => {
    if (!newCustomContactLabel.trim() || !newCustomContactVal.trim()) {
      showToast('Validation Error', 'Please fill in both field label and value.', 'error');
      return;
    }
    const newContact = {
      id: Date.now().toString(),
      label: newCustomContactLabel.trim(),
      value: newCustomContactVal.trim()
    };

    setContactDetails(prev => ({
      ...prev,
      customContacts: [...(prev.customContacts || []), newContact]
    }));

    setNewCustomContactLabel('');
    setNewCustomContactVal('');
    showToast('Custom Contact Field Added', `Added ${newCustomContactLabel}. Save changes to finalize.`, 'info');
  };

  const handleRemoveCustomContact = (id) => {
    setContactDetails(prev => ({
      ...prev,
      customContacts: (prev.customContacts || []).filter(item => item.id !== id)
    }));
  };

  const handleSaveSocialLinks = async () => {
    setSocialsSaving(true);
    try {
      const response = await api.post('/settings/social-links', { socialLinks });
      if (response.data?.success) {
        setSocialLinks(prev => ({ ...prev, ...response.data.socialLinks }));
        showToast(
          'Social Media Links Saved',
          'System-wide social media links updated successfully across website header, footer & mobile apps!',
          'success'
        );
      }
    } catch (error) {
      showToast('Save Failed', error.response?.data?.message || 'Failed to save system social links.', 'error');
    } finally {
      setSocialsSaving(false);
    }
  };

  const handleSaveContactDetails = async () => {
    setContactsSaving(true);
    try {
      const response = await api.post('/settings/contact-details', { contactDetails });
      if (response.data?.success) {
        setContactDetails(prev => ({ ...prev, ...response.data.contactDetails }));
        showToast(
          'Contact & Support Details Saved',
          'Official contact numbers, emails, and address updated successfully!',
          'success'
        );
      }
    } catch (error) {
      showToast('Save Failed', error.response?.data?.message || 'Failed to save system contact details.', 'error');
    } finally {
      setContactsSaving(false);
    }
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '50px' }}>
      
      {/* PAGE HEADER */}
      <div className="page-header" style={{ marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', letterSpacing: '0.5px' }}>
              SETTINGS & PREFERENCES
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' }}>
            General <span style={{ color: 'var(--primary)' }}>Preferences</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Manage real-time notifications, operation security passkeys, contact phone/emails, and official social media links.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* CARD 1: SYSTEM & OPERATION PREFERENCES */}
        <div className="card fade-in" style={{ padding: '32px', borderRadius: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Sliders size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>System & Operation Preferences</h2>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Toggle system alerts and high-level authorization rules.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* PUSH NOTIFICATIONS TOGGLE CARD */}
            <div style={{ padding: '22px 24px', border: '1px solid var(--border)', borderRadius: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: '280px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: isNotificationsEnabled ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isNotificationsEnabled ? 'var(--primary)' : '#ef4444', flexShrink: 0 }}>
                  {isNotificationsEnabled ? <Bell size={24} /> : <BellOff size={24} />}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Push & System Notification Alerts</h4>
                    <span style={{ fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px', backgroundColor: isNotificationsEnabled ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(239, 68, 68, 0.1)', color: isNotificationsEnabled ? 'var(--primary)' : '#ef4444' }}>
                      {isNotificationsEnabled ? 'ACTIVE' : 'MUTED'}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    Receive real-time push and notification banner alerts for new bookings, vendor registrations, and website enquiries in topbar.
                  </p>
                </div>
              </div>
              
              <div 
                onClick={toggleNotifications}
                style={{ width: '56px', height: '30px', backgroundColor: isNotificationsEnabled ? 'var(--primary)' : '#cbd5e1', borderRadius: '24px', position: 'relative', cursor: 'pointer', transition: '0.3s', flexShrink: 0 }}
              >
                <div style={{ width: '24px', height: '24px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: isNotificationsEnabled ? '29px' : '3px', transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
              </div>
            </div>

            {/* PASSKEY TOGGLE CARD */}
            <div style={{ padding: '22px 24px', border: '1px solid var(--border)', borderRadius: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: '280px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: isPasskeyEnabled ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isPasskeyEnabled ? '#10b981' : '#ef4444', flexShrink: 0 }}>
                  {isPasskeyEnabled ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Passkey Authorization Requirement</h4>
                    <span style={{ fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '8px', backgroundColor: isPasskeyEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: isPasskeyEnabled ? '#10b981' : '#ef4444' }}>
                      {isPasskeyEnabled ? 'PASSKEY ENABLED (ON)' : 'PASSKEY TURNED OFF'}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                    Turn OFF to perform administrative operations (creating, editing or deleting categories, services, destinations, sub-services, staff, policies) directly without prompting for a 6-digit email passkey.
                  </p>
                </div>
              </div>
              
              <div 
                onClick={!passkeyLoading ? handleTogglePasskey : undefined}
                style={{ width: '56px', height: '30px', backgroundColor: isPasskeyEnabled ? 'var(--primary)' : '#cbd5e1', borderRadius: '24px', position: 'relative', cursor: passkeyLoading ? 'wait' : 'pointer', transition: '0.3s', flexShrink: 0 }}
              >
                <div style={{ width: '24px', height: '24px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: isPasskeyEnabled ? '29px' : '3px', transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
              </div>
            </div>

          </div>
        </div>

        {/* CARD 2: OFFICIAL SYSTEM CONTACT & SUPPORT INFORMATION */}
        <div className="card fade-in" style={{ padding: '32px', borderRadius: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <PhoneCall size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Official System Contact & Support Numbers</h2>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Configure phone numbers, customer emails, emergency hotlines and office address shown across site.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={fetchContactDetails}
                className="btn btn-secondary"
                disabled={contactsLoading || contactsSaving}
                style={{ height: '40px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', borderRadius: '10px' }}
              >
                <RefreshCw size={15} className={contactsLoading ? 'spin' : ''} />
                Reload
              </button>
              <button
                type="button"
                onClick={handleSaveContactDetails}
                className="btn btn-primary"
                disabled={contactsSaving}
                style={{ height: '40px', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}
              >
                <Save size={16} />
                {contactsSaving ? 'Saving Contact Info...' : 'Save Contact Details'}
              </button>
            </div>
          </div>

          {/* CONTACT INPUT FIELDS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginBottom: '28px' }}>
            
            {/* Primary Phone */}
            <div style={{ padding: '18px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PhoneCall size={16} style={{ color: 'var(--primary)' }} />
                Primary Contact Number
              </label>
              <input
                type="text"
                value={contactDetails.primaryPhone || ''}
                onChange={(e) => handleContactInputChange('primaryPhone', e.target.value)}
                placeholder="+91 98765 43210"
                className="form-control"
                style={{ height: '42px', fontSize: '13px', borderRadius: '10px' }}
              />
            </div>

            {/* Support Phone */}
            <div style={{ padding: '18px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Headphones size={16} style={{ color: '#0ea5e9' }} />
                Customer Support / Helpline
              </label>
              <input
                type="text"
                value={contactDetails.supportPhone || ''}
                onChange={(e) => handleContactInputChange('supportPhone', e.target.value)}
                placeholder="+91 98765 43211 / 1800-123-4567"
                className="form-control"
                style={{ height: '42px', fontSize: '13px', borderRadius: '10px' }}
              />
            </div>

            {/* Emergency Phone */}
            <div style={{ padding: '18px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} style={{ color: '#ef4444' }} />
                24/7 Emergency Helpline
              </label>
              <input
                type="text"
                value={contactDetails.emergencyPhone || ''}
                onChange={(e) => handleContactInputChange('emergencyPhone', e.target.value)}
                placeholder="+91 99887 76655"
                className="form-control"
                style={{ height: '42px', fontSize: '13px', borderRadius: '10px' }}
              />
            </div>

            {/* Primary Email */}
            <div style={{ padding: '18px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} style={{ color: 'var(--primary)' }} />
                Primary Official Email
              </label>
              <input
                type="email"
                value={contactDetails.primaryEmail || ''}
                onChange={(e) => handleContactInputChange('primaryEmail', e.target.value)}
                placeholder="info@ababatravels.com"
                className="form-control"
                style={{ height: '42px', fontSize: '13px', borderRadius: '10px' }}
              />
            </div>

            {/* Support Email */}
            <div style={{ padding: '18px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LifeBuoy size={16} style={{ color: '#6366f1' }} />
                Helpdesk & Support Email
              </label>
              <input
                type="email"
                value={contactDetails.supportEmail || ''}
                onChange={(e) => handleContactInputChange('supportEmail', e.target.value)}
                placeholder="support@ababatravels.com"
                className="form-control"
                style={{ height: '42px', fontSize: '13px', borderRadius: '10px' }}
              />
            </div>

            {/* Booking Email */}
            <div style={{ padding: '18px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} style={{ color: '#8b5cf6' }} />
                Bookings & Inquiries Email
              </label>
              <input
                type="email"
                value={contactDetails.bookingEmail || ''}
                onChange={(e) => handleContactInputChange('bookingEmail', e.target.value)}
                placeholder="bookings@ababatravels.com"
                className="form-control"
                style={{ height: '42px', fontSize: '13px', borderRadius: '10px' }}
              />
            </div>

            {/* Working Hours */}
            <div style={{ padding: '18px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 1' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} style={{ color: '#f59e0b' }} />
                Support Operating Hours
              </label>
              <input
                type="text"
                value={contactDetails.workingHours || ''}
                onChange={(e) => handleContactInputChange('workingHours', e.target.value)}
                placeholder="Mon - Sat: 9:00 AM - 8:00 PM IST"
                className="form-control"
                style={{ height: '42px', fontSize: '13px', borderRadius: '10px' }}
              />
            </div>

            {/* Physical Address */}
            <div style={{ padding: '18px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={16} style={{ color: '#10b981' }} />
                Headquarters / Physical Office Address
              </label>
              <textarea
                rows={2}
                value={contactDetails.address || ''}
                onChange={(e) => handleContactInputChange('address', e.target.value)}
                placeholder="Ababa Travels HQ, MG Road, Fort Kochi, Kerala 682001, India"
                className="form-control"
                style={{ fontSize: '13px', borderRadius: '10px', padding: '10px 14px', resize: 'vertical' }}
              />
            </div>

          </div>

          {/* DYNAMIC CUSTOM CONTACT FIELDS SECTION */}
          <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '18px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} style={{ color: '#10b981' }} />
              Additional Custom Contact Fields (Toll-Free, Fax, Branch Office)
            </h3>

            {/* Custom Contacts List */}
            {contactDetails.customContacts && contactDetails.customContacts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {contactDetails.customContacts.map((custom) => (
                  <div 
                    key={custom.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '12px 16px', 
                      borderRadius: '12px', 
                      background: 'var(--bg-main)', 
                      border: '1px solid var(--border)',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '200px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
                        {custom.label}
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '600' }}>
                        {custom.value}
                      </span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveCustomContact(custom.id)}
                      className="btn btn-danger-soft" 
                      style={{ height: '32px', width: '32px', padding: 0, borderRadius: '8px', color: '#ef4444' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>No custom contact fields added yet. You can add Toll-Free numbers, Fax, Branch addresses, etc.</p>
            )}

            {/* Add Custom Contact Field Input Bar */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Field Label (e.g. Dubai Branch Office, Toll Free)"
                value={newCustomContactLabel}
                onChange={(e) => setNewCustomContactLabel(e.target.value)}
                className="form-control"
                style={{ flex: '1 1 200px', height: '42px', fontSize: '13px', borderRadius: '10px' }}
              />
              <input
                type="text"
                placeholder="Contact Value / Number / Details"
                value={newCustomContactVal}
                onChange={(e) => setNewCustomContactVal(e.target.value)}
                className="form-control"
                style={{ flex: '2 1 300px', height: '42px', fontSize: '13px', borderRadius: '10px' }}
              />
              <button
                type="button"
                onClick={handleAddCustomContact}
                className="btn btn-secondary"
                style={{ height: '42px', padding: '0 18px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', borderRadius: '10px', whiteSpace: 'nowrap' }}
              >
                <Plus size={16} />
                Add Contact Field
              </button>
            </div>
          </div>

          {/* BOTTOM SAVE CONTACT BUTTON */}
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleSaveContactDetails}
              className="btn btn-primary"
              disabled={contactsSaving}
              style={{ height: '44px', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '700', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)' }}
            >
              <Save size={18} />
              {contactsSaving ? 'Saving Contact Info...' : 'Save All Contact Details'}
            </button>
          </div>

        </div>

        {/* CARD 3: OFFICIAL SYSTEM SOCIAL MEDIA LINKS */}
        <div className="card fade-in" style={{ padding: '32px', borderRadius: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
                <Share2 size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Official System Social Media Links</h2>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Configure platform social media channels displayed on main website footer, mobile app & communications.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={fetchSocialLinks}
                className="btn btn-secondary"
                disabled={socialsLoading || socialsSaving}
                style={{ height: '40px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', borderRadius: '10px' }}
              >
                <RefreshCw size={15} className={socialsLoading ? 'spin' : ''} />
                Reload
              </button>
              <button
                type="button"
                onClick={handleSaveSocialLinks}
                className="btn btn-primary"
                disabled={socialsSaving}
                style={{ height: '40px', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)', boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.25)' }}
              >
                <Save size={16} />
                {socialsSaving ? 'Saving Links...' : 'Save Social Media Links'}
              </button>
            </div>
          </div>

          {/* SOCIAL PLATFORMS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px', marginBottom: '28px' }}>
            {socialPlatformsConfig.map((item) => {
              const currentVal = socialLinks[item.key] || '';
              return (
                <div 
                  key={item.key} 
                  style={{ 
                    padding: '18px 20px', 
                    borderRadius: '16px', 
                    border: '1px solid var(--border)', 
                    background: 'var(--bg-main)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.icon}
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{item.label}</span>
                    </div>

                    {currentVal && (
                      <a
                        href={currentVal}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--primary)', fontWeight: '700', textDecoration: 'none', background: 'rgba(var(--primary-rgb), 0.08)', padding: '4px 10px', borderRadius: '8px' }}
                      >
                        <span>Test</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  <div style={{ position: 'relative' }}>
                    <input
                      type="url"
                      value={currentVal}
                      onChange={(e) => handleSocialInputChange(item.key, e.target.value)}
                      placeholder={item.placeholder}
                      className="form-control"
                      style={{ 
                        height: '42px', 
                        fontSize: '13px', 
                        borderRadius: '10px',
                        paddingRight: '36px'
                      }}
                    />
                    {currentVal && (
                      <CheckCircle size={16} style={{ position: 'absolute', right: '12px', top: '13px', color: '#10b981' }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* DYNAMIC CUSTOM SOCIAL MEDIA LINKS SECTION */}
          <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '18px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={18} style={{ color: 'var(--primary)' }} />
              Additional Custom Social & Web Channels
            </h3>

            {/* Custom Links List */}
            {socialLinks.customLinks && socialLinks.customLinks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {socialLinks.customLinks.map((custom) => (
                  <div 
                    key={custom.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '12px 16px', 
                      borderRadius: '12px', 
                      background: 'var(--bg-main)', 
                      border: '1px solid var(--border)',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '200px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', background: 'rgba(var(--primary-rgb), 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
                        {custom.title}
                      </span>
                      <a href={custom.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: 'var(--text-main)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {custom.url}
                      </a>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <a href={custom.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ height: '32px', padding: '0 10px', fontSize: '12px', borderRadius: '8px' }}>
                        <ExternalLink size={14} />
                      </a>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveCustomLink(custom.id)}
                        className="btn btn-danger-soft" 
                        style={{ height: '32px', width: '32px', padding: 0, borderRadius: '8px', color: '#ef4444' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>No custom social media channels added yet. You can add links to Tripadvisor, Threads, Medium, Discord, etc.</p>
            )}

            {/* Add Custom Link Input Bar */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Platform Name (e.g. Threads, Tripadvisor)"
                value={newCustomTitle}
                onChange={(e) => setNewCustomTitle(e.target.value)}
                className="form-control"
                style={{ flex: '1 1 200px', height: '42px', fontSize: '13px', borderRadius: '10px' }}
              />
              <input
                type="url"
                placeholder="Target URL (e.g. https://tripadvisor.com/...)"
                value={newCustomUrl}
                onChange={(e) => setNewCustomUrl(e.target.value)}
                className="form-control"
                style={{ flex: '2 1 300px', height: '42px', fontSize: '13px', borderRadius: '10px' }}
              />
              <button
                type="button"
                onClick={handleAddCustomLink}
                className="btn btn-secondary"
                style={{ height: '42px', padding: '0 18px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', borderRadius: '10px', whiteSpace: 'nowrap' }}
              >
                <Plus size={16} />
                Add Link
              </button>
            </div>
          </div>

          {/* BOTTOM SAVE BAR */}
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleSaveSocialLinks}
              className="btn btn-primary"
              disabled={socialsSaving}
              style={{ height: '44px', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '700', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)', boxShadow: '0 4px 14px rgba(var(--primary-rgb), 0.3)' }}
            >
              <Save size={18} />
              {socialsSaving ? 'Saving Links...' : 'Save All Social Media Links'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default GeneralSettings;
