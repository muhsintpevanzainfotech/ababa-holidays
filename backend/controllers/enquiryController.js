const Enquiry = require('../models/Enquiry');

exports.createEnquiry = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (req.file) {
      payload.file = req.file.path;
    }
    const enquiry = await Enquiry.create(payload);
    res.status(201).json({ success: true, data: enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEnquiries = async (req, res) => {
  try {
    const filter = {};
    if (req.user && req.user.role === 'Vendor') {
      filter.vendor = req.user.id;
    } else if (req.query.vendor) {
      filter.vendor = req.query.vendor;
    }

    const enquiries = await Enquiry.find(filter).populate('vendor', 'name email').populate('followUps.followedUpBy', 'name email').sort('-createdAt');
    res.status(200).json({ success: true, count: enquiries.length, data: enquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addFollowUp = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    const followUp = {
      note: req.body.note,
      followedUpBy: req.user ? req.user.id : null,
      date: Date.now()
    };

    if (req.body.status) {
      enquiry.status = req.body.status;
    }

    enquiry.followUps.push(followUp);
    await enquiry.save();

    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
