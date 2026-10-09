const Enquiry = require('../models/Enquiry');
const { notifyAdmin, notifyVendor } = require('../utils/notificationHelper');

exports.createEnquiry = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (req.file) {
      payload.file = req.file.path;
    }
    const enquiry = await Enquiry.create(payload);

    // Dispatch System Notification for Admin
    await notifyAdmin({
      title: `New Enquiry: ${payload.serviceOfInterest || 'Travel Request'}`,
      message: `${payload.name || 'A customer'} (${payload.phone || payload.email || 'No contact'}): "${(payload.message || '').slice(0, 75)}"`,
      category: 'enquiry',
      type: 'info',
      link: '/website/enquiries',
      metadata: { enquiryId: enquiry._id, name: payload.name, email: payload.email, phone: payload.phone, service: payload.serviceOfInterest }
    });

    // If enquiry is vendor-specific, notify the vendor
    if (payload.vendor) {
      await notifyVendor(payload.vendor, {
        title: `New Package Enquiry: ${payload.serviceOfInterest || 'General'}`,
        message: `${payload.name || 'A customer'} sent an inquiry: "${(payload.message || '').slice(0, 75)}"`,
        category: 'enquiry',
        type: 'info',
        link: '/platform/enquiries',
        metadata: { enquiryId: enquiry._id, name: payload.name, email: payload.email, phone: payload.phone }
      });
    }

    res.status(201).json({ success: true, data: enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEnquiries = async (req, res) => {
  try {
    const filter = {};
    if (req.user && (req.user.role === 'Vendor' || req.user.role === 'Vendor-Staff' || req.user.role === 'Staff')) {
      const vId = req.user.effectiveVendorId || req.user.vendor || req.user.vendorId || req.user._id;
      filter.$or = [{ vendor: vId }, { vendor: req.user._id }];
    } else if (req.query.vendor && req.query.vendor !== 'undefined' && req.query.vendor !== 'null' && req.query.vendor.match(/^[0-9a-fA-F]{24}$/)) {
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
