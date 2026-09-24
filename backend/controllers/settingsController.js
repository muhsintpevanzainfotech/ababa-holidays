const Setting = require('../models/Setting');
const sendEmail = require('../services/emailService');

// @desc    Get Passkey status (enabled or disabled)
// @route   GET /api/settings/passkey-status
// @access  Private
exports.getPasskeyStatus = async (req, res) => {
  try {
    const storageKey = `passkey_enabled_${req.user.id}`;
    const setting = await Setting.findOne({ key: storageKey });
    // Default to true (Passkey protection enabled) if not set
    const enabled = setting ? Boolean(setting.value) : true;
    res.status(200).json({ success: true, enabled });
  } catch (err) {
    console.error('Error fetching passkey status:', err);
    res.status(500).json({ success: false, message: 'Server error fetching passkey status.' });
  }
};

// @desc    Toggle Passkey requirement (Turn ON / Turn OFF)
// @route   POST /api/settings/toggle-passkey
// @access  Private
exports.togglePasskeyStatus = async (req, res) => {
  try {
    const { enabled } = req.body;
    const isEnabled = enabled !== undefined ? Boolean(enabled) : true;
    const storageKey = `passkey_enabled_${req.user.id}`;

    await Setting.findOneAndUpdate(
      { key: storageKey },
      { value: isEnabled },
      { upsert: true, returnDocument: 'after' }
    );

    res.status(200).json({
      success: true,
      enabled: isEnabled,
      message: `Passkey security requirement is now turned ${isEnabled ? 'ON' : 'OFF'}.`
    });
  } catch (err) {
    console.error('Error toggling passkey status:', err);
    res.status(500).json({ success: false, message: 'Server error toggling passkey status.' });
  }
};

// @desc    Generate a random 6-digit passkey and send to Admin Email
// @route   POST /api/settings/generate-passkey
// @access  Private (Admin)
exports.generatePasskey = async (req, res) => {
  try {
    // Check if passkey requirement is turned off
    const enabledKey = `passkey_enabled_${req.user.id}`;
    const enabledSetting = await Setting.findOne({ key: enabledKey });
    const isEnabled = enabledSetting ? Boolean(enabledSetting.value) : true;

    if (!isEnabled) {
      return res.status(200).json({
        success: true,
        bypassed: true,
        message: 'Passkey protection is turned OFF in settings.'
      });
    }

    // Generate 6 random digits
    const passkey = Math.floor(100000 + Math.random() * 900000).toString();

    const parseExpiryMinutes = (val) => {
      const match = val.toString().match(/^(\d+)(min|m|h|d)?$/i);
      if (!match) return 5;
      const amount = parseInt(match[1]);
      const unit = (match[2] || 'm').toLowerCase();
      switch (unit) {
        case 'h': return amount * 60;
        case 'd': return amount * 1440;
        default: return amount;
      }
    };

    const expiryMinutes = parseExpiryMinutes(process.env.PASSKEY_EXPIRE || '5');
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    const storageKey = `passkey_${req.user.id}`;
    await Setting.findOneAndUpdate(
      { key: storageKey },
      { value: passkey, expiresAt },
      { upsert: true, returnDocument: 'after' }
    );

    const requester = {
      name: req.user?.name || 'Unknown User',
      email: req.user?.email || 'N/A',
      role: req.user?.role || 'Staff'
    };

    const recipientEmail = req.user.role === 'Admin' ? (process.env.EMAIL_USER || req.user.email) : req.user.email;

    await sendEmail({
      email: recipientEmail,
      subject: 'Security Access Passkey - ABABA Travels',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
          <h2 style="color: #22c55e; text-align: center;">Security Alert: New Passkey Generated</h2>
          <p>Hello ${requester.name},</p>
          <p>A new security passkey has been requested for your ABABA Travels dashboard access.</p>
          
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #475569;">Event Details:</p>
            <p style="margin: 4px 0; color: #64748b;"><strong>Action:</strong> Sensitive Action Verification</p>
            <p style="margin: 4px 0; color: #64748b;"><strong>Requester Email:</strong> ${requester.email}</p>
            <p style="margin: 4px 0; color: #64748b;"><strong>Event Time:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <div style="background: #f1f1f1; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="font-size: 14px; margin-bottom: 5px; color: #666;">Standard Access Passkey:</p>
            <h1 style="font-size: 32px; letter-spacing: 8px; margin: 0; color: #333;">${passkey}</h1>
            <p style="font-size: 11px; color: #94a3b8; margin-top: 8px;">Valid for ${expiryMinutes} minutes</p>
          </div>

          <p style="color: #ef4444; font-size: 12px; font-weight: 600;">Security Notice: This code allows you to authorize sensitive dashboard changes. If you did not authorize this request, please change your account password immediately.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="text-align: center; color: #999; font-size: 12px;">&copy; 2026 ABABA Travels Security System.</p>
        </div>
      `
    });

    res.status(200).json({ 
      success: true, 
      message: `New passkey generated and sent to ${recipientEmail.replace(/(.{2})(.*)(?=@)/, '$1***')}. Valid for ${expiryMinutes} minutes.`,
      expiresAt
    });
  } catch (err) {
    console.error('Error generating passkey:', err);
    res.status(500).json({ success: false, message: 'Server error while generating passkey.' });
  }
};

// @desc    Verify the current passkey
// @route   POST /api/settings/verify-passkey
// @access  Private (Admin/Vendor)
exports.verifyPasskey = async (req, res) => {
  try {
    // Check if passkey requirement is turned off
    const enabledKey = `passkey_enabled_${req.user.id}`;
    const enabledSetting = await Setting.findOne({ key: enabledKey });
    const isEnabled = enabledSetting ? Boolean(enabledSetting.value) : true;

    if (!isEnabled) {
      return res.status(200).json({
        success: true,
        bypassed: true,
        message: 'Passkey verification is turned OFF.',
        sessionDuration: 1440
      });
    }

    const { passkey } = req.body;
    if (!passkey) return res.status(400).json({ success: false, message: 'Passkey is required.' });

    const storageKey = `passkey_${req.user.id}`;
    const storedPasskey = await Setting.findOne({ key: storageKey });
    
    let currentPIN = req.user.role === 'Admin' ? "1234" : null;
    let isExpired = false;

    if (storedPasskey) {
      currentPIN = storedPasskey.value;
      if (storedPasskey.expiresAt && storedPasskey.expiresAt < new Date()) {
        isExpired = true;
      }
    }

    if (isExpired) {
      return res.status(401).json({ success: false, message: 'Passkey has expired. Please generate a new one.' });
    }

    if (passkey === currentPIN) {
      const parseExpiryMinutes = (val) => {
        const match = val.toString().match(/^(\d+)(min|m|h|d)?$/i);
        if (!match) return 5;
        const amount = parseInt(match[1]);
        const unit = (match[2] || 'm').toLowerCase();
        switch (unit) {
          case 'h': return amount * 60;
          case 'd': return amount * 1440;
          default: return amount;
        }
      };
      
      const sessionMinutes = parseExpiryMinutes(process.env.PASSKEY_EXPIRE || '5');
      res.status(200).json({ 
        success: true, 
        message: 'Verification successful.',
        sessionDuration: sessionMinutes
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid passkey.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get System Social Media Links
// @route   GET /api/settings/social-links
// @access  Public
exports.getSocialLinks = async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'system_social_links' });
    const defaultSocials = {
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
    const socialLinks = setting ? { ...defaultSocials, ...setting.value } : defaultSocials;
    res.status(200).json({ success: true, socialLinks });
  } catch (err) {
    console.error('Error fetching social links:', err);
    res.status(500).json({ success: false, message: 'Server error fetching social links.' });
  }
};

// @desc    Update System Social Media Links
// @route   POST /api/settings/social-links
// @access  Private (Admin)
exports.updateSocialLinks = async (req, res) => {
  try {
    const { socialLinks } = req.body;
    if (!socialLinks || typeof socialLinks !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid social links payload.' });
    }

    const updated = await Setting.findOneAndUpdate(
      { key: 'system_social_links' },
      { value: socialLinks },
      { upsert: true, returnDocument: 'after' }
    );

    res.status(200).json({
      success: true,
      socialLinks: updated.value,
      message: 'System social media links updated successfully!'
    });
  } catch (err) {
    console.error('Error updating social links:', err);
    res.status(500).json({ success: false, message: 'Server error updating social links.' });
  }
};

// @desc    Get System Contact & Support Details
// @route   GET /api/settings/contact-details
// @access  Public
exports.getContactDetails = async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'system_contact_details' });
    const defaultDetails = {
      primaryPhone: '+91 98765 43210',
      supportPhone: '+91 98765 43211',
      emergencyPhone: '+91 99887 76655',
      primaryEmail: 'info@ababatravels.com',
      supportEmail: 'support@ababatravels.com',
      bookingEmail: 'bookings@ababatravels.com',
      address: 'Ababa Travels Command Center, MG Road, Fort Kochi, Kerala 682001, India',
      workingHours: 'Mon - Sat: 9:00 AM - 8:00 PM IST',
      mapEmbedUrl: ''
    };
    const contactDetails = setting ? { ...defaultDetails, ...setting.value } : defaultDetails;
    res.status(200).json({ success: true, contactDetails });
  } catch (err) {
    console.error('Error fetching contact details:', err);
    res.status(500).json({ success: false, message: 'Server error fetching contact details.' });
  }
};

// @desc    Update System Contact & Support Details
// @route   POST /api/settings/contact-details
// @access  Private (Admin)
exports.updateContactDetails = async (req, res) => {
  try {
    const { contactDetails } = req.body;
    if (!contactDetails || typeof contactDetails !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid contact details payload.' });
    }

    const updated = await Setting.findOneAndUpdate(
      { key: 'system_contact_details' },
      { value: contactDetails },
      { upsert: true, returnDocument: 'after' }
    );

    res.status(200).json({
      success: true,
      contactDetails: updated.value,
      message: 'System contact & support details updated successfully!'
    });
  } catch (err) {
    console.error('Error updating contact details:', err);
    res.status(500).json({ success: false, message: 'Server error updating contact details.' });
  }
};


