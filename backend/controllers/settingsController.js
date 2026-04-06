const Setting = require('../models/Setting');
const sendEmail = require('../services/emailService');
const crypto = require('crypto');

// @desc    Generate a random 6-digit passkey and send to Admin Email
// @route   POST /api/settings/generate-passkey
// @access  Private (Admin)
exports.generatePasskey = async (req, res) => {
  try {
    // Generate 6 random digits
    const passkey = Math.floor(100000 + Math.random() * 900000).toString();

    // Helper function to parse '5min', '1m', etc.
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

    // Get duration from .env or default to 5 minutes
    const expiryMinutes = parseExpiryMinutes(process.env.PASSKEY_EXPIRE || '5');
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Store in DB (Upsert) - Use a per-user key
    const storageKey = `passkey_${req.user.id}`;
    await Setting.findOneAndUpdate(
      { key: storageKey },
      { value: passkey, expiresAt },
      { upsert: true, returnDocument: 'after' }
    );

    // Get user details
    const requester = {
      name: req.user?.name || 'Unknown User',
      email: req.user?.email || 'N/A',
      role: req.user?.role || 'Staff'
    };

    // Recipient: For Admin role we can still use process.env.EMAIL_USER if preferred, 
    // but usually for vendors it should be their own email.
    const recipientEmail = req.user.role === 'Admin' ? (process.env.EMAIL_USER || req.user.email) : req.user.email;

    // Send via Email
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
  const { passkey } = req.body;
  if (!passkey) return res.status(400).json({ success: false, message: 'Passkey is required.' });

  try {
    const storageKey = `passkey_${req.user.id}`;
    const storedPasskey = await Setting.findOne({ key: storageKey });
    
    // Default fallback if not yet set in DB (use 1234, no expiry) - ONLY for Admin role
    // Actually better to not have fallback for Vendors.
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
      // Helper function to parse '5min', '1m', etc.
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
        sessionDuration: sessionMinutes // Minutes for which session is valid
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid passkey.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
