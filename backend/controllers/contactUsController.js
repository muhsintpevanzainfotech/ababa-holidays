const ContactUs = require('../models/ContactUs');

exports.createContactMessage = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (req.file) {
      payload.file = req.file.path;
    }
    const contactMessage = await ContactUs.create(payload);
    res.status(201).json({ success: true, data: contactMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getContactMessages = async (req, res) => {
  try {
    const filter = {};
    if (req.user && req.user.role === 'Vendor') {
      filter.vendor = req.user.id;
    } else if (req.query.vendor) {
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
