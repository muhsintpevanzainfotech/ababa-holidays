const ContactUs = require('../models/ContactUs');
const { notifyAdmin, notifyVendor } = require('../utils/notificationHelper');

exports.createContactMessage = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (req.file) {
      payload.file = req.file.path;
    }
    const contactMessage = await ContactUs.create(payload);

    // Dispatch System Notification for Admin
    await notifyAdmin({
      title: 'New Contact Message',
      message: `${payload.name || 'A customer'} (${payload.email || 'No email'}) sent a message: "${(payload.subject || payload.message || '').slice(0, 70)}"`,
      category: 'contact',
      type: 'info',
      link: '/website/contact-us',
      metadata: { contactId: contactMessage._id, name: payload.name, email: payload.email, phone: payload.phone }
    });

    // If message is vendor-specific, notify the vendor
    if (payload.vendor) {
      await notifyVendor(payload.vendor, {
        title: 'New Customer Inquiry',
        message: `${payload.name || 'A customer'} sent an inquiry: "${(payload.subject || payload.message || '').slice(0, 70)}"`,
        category: 'contact',
        type: 'info',
        link: '/platform/contact-us',
        metadata: { contactId: contactMessage._id, name: payload.name, email: payload.email, phone: payload.phone }
      });
    }

    res.status(201).json({ success: true, data: contactMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getContactMessages = async (req, res) => {
  try {
    const filter = {};
    if (req.user && (req.user.role === 'Vendor' || req.user.role === 'Vendor-Staff' || req.user.role === 'Staff')) {
      const vId = req.user.effectiveVendorId || req.user.vendor || req.user.vendorId || req.user._id;
      filter.$or = [{ vendor: vId }, { vendor: req.user._id }];
    } else if (req.query.vendor && req.query.vendor !== 'undefined' && req.query.vendor !== 'null' && req.query.vendor.match(/^[0-9a-fA-F]{24}$/)) {
      filter.vendor = req.query.vendor;
    }

    const messages = await ContactUs.find(filter).populate('vendor', 'name email').sort('-createdAt');
    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateContactMessage = async (req, res) => {
  try {
    const message = await ContactUs.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!message) {
      return res.status(404).json({ success: false, message: 'Contact message not found' });
    }
    res.status(200).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteContactMessage = async (req, res) => {
  try {
    const message = await ContactUs.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Contact message not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
