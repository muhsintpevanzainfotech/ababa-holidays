const Complaint = require('../models/Complaint');
const User = require('../models/User');

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private
exports.createComplaint = async (req, res) => {
  try {
    const { defendant, subject, description } = req.body;
    
    // Check if defendant exists
    const defendantExists = await User.findById(defendant);
    if (!defendantExists) {
      return res.status(404).json({ success: false, message: 'Defendant user not found' });
    }

    const complaintData = {
      complainant: req.user.id,
      defendant,
      subject,
      description,
      images: []
    };
    
    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      complaintData.images = req.files.map(file => file.path.replace(/\\/g, '/'));
    }

    const complaint = await Complaint.create(complaintData);

    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all complaints (Admin) or complaints related to user (Vendor/User)
// @route   GET /api/complaints
// @access  Private
exports.getComplaints = async (req, res) => {
  try {
    let query;

    if (req.user.role === 'Admin' || req.user.role === 'Sub-Admin') {
      // Admins see everything
      query = Complaint.find().populate('complainant', 'name email').populate('defendant', 'name email role');
    } else {
      // Others see complaints they made or are about them
      query = Complaint.find({
        $or: [
          { complainant: req.user.id },
          { defendant: req.user.id }
        ]
      }).populate('complainant', 'name email').populate('defendant', 'name email role');
    }

    const complaints = await query.sort('-createdAt');
    res.status(200).json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get complaints for a specific user (Admin filtered check)
// @route   GET /api/complaints/user/:userId
// @access  Private
exports.getUserComplaints = async (req, res) => {
  try {
    // Only admins or the user themselves can see their specific history from this endpoint
    if (req.user.role !== 'Admin' && req.user.role !== 'Sub-Admin' && req.user.id !== req.params.userId) {
       return res.status(403).json({ success: false, message: 'Not authorized to view these complaints' });
    }

    const complaints = await Complaint.find({
      $or: [
        { complainant: req.params.userId },
        { defendant: req.params.userId }
      ]
    }).populate('complainant', 'name email role').populate('defendant', 'name email role').sort('-createdAt');

    res.status(200).json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id
// @access  Private (Admin/Sub-Admin only)
exports.updateComplaint = async (req, res) => {
  try {
    let complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Only Admin can resolve
    if (req.user.role !== 'Admin' && req.user.role !== 'Sub-Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update complaints' });
    }

    const { status, resolution } = req.body;
    
    const updateData = { status };
    if (status === 'Resolved' || status === 'Spam') {
      updateData.resolution = resolution;
      updateData.resolvedBy = req.user.id;
      updateData.resolvedAt = Date.now();
    }

    complaint = await Complaint.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private (Admin only)
exports.deleteComplaint = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete complaints' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    await complaint.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
