const Destination = require('../models/Destination');
const fs = require('fs');
const path = require('path');

const deleteFile = (filePath) => {
  if (filePath && !filePath.startsWith('http')) {
    const absolutePath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch (err) {
        console.error('Failed to delete file:', err);
      }
    }
  }
};

// @desc    Get all destinations
// @route   GET /api/destinations
// @access  Public
exports.getDestinations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status && req.query.status !== 'all') {
      filter.isActive = req.query.status === 'active';
    }
    if (req.query.state && req.query.state !== 'all') {
      filter.state = req.query.state;
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const total = await Destination.countDocuments(filter);
    const destinations = await Destination.find(filter)
      .populate({
        path: 'state',
        select: 'name country',
        populate: {
          path: 'country',
          select: 'name'
        }
      })
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ 
      success: true, 
      count: destinations.length, 
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: destinations 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get destinations by state
// @route   GET /api/destinations/state/:stateId
// @access  Public
exports.getDestinationsByState = async (req, res, next) => {
  try {
    const destinations = await Destination.find({ state: req.params.stateId }).sort({ name: 1 });
    res.status(200).json({ success: true, count: destinations.length, data: destinations });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single destination
// @route   GET /api/destinations/:id
// @access  Public
exports.getDestination = async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id)
      .populate({
        path: 'state',
        select: 'name country',
        populate: {
          path: 'country',
          select: 'name'
        }
      });
    if (!destination) return res.status(404).json({ success: false, message: 'Destination not found' });
    res.status(200).json({ success: true, data: destination });
  } catch (error) {
    next(error);
  }
};

// @desc    Create destination
// @route   POST /api/destinations
// @access  Private/Admin
exports.createDestination = async (req, res, next) => {
  try {
    if (req.file) {
      req.body.image = `uploads/${req.file.filename}`;
    }
    let destination = await Destination.create(req.body);
    destination = await destination.populate({
      path: 'state',
      select: 'name country',
      populate: { path: 'country', select: 'name' }
    });
    res.status(201).json({ success: true, data: destination });
  } catch (error) {
    if (req.file) deleteFile(`uploads/${req.file.filename}`);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'This destination name already exists in the selected state' });
    }
    next(error);
  }
};

// @desc    Update destination
// @route   PUT /api/destinations/:id
// @access  Private/Admin
exports.updateDestination = async (req, res, next) => {
  try {
    let destination = await Destination.findById(req.params.id);
    if (!destination) return res.status(404).json({ success: false, message: 'Destination not found' });

    if (req.file) {
      deleteFile(destination.image);
      req.body.image = `uploads/${req.file.filename}`;
    }

    destination = await Destination.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate({
      path: 'state',
      select: 'name country',
      populate: { path: 'country', select: 'name' }
    });

    res.status(200).json({ success: true, data: destination });
  } catch (error) {
    if (req.file) deleteFile(`uploads/${req.file.filename}`);
    next(error);
  }
};

// @desc    Delete destination
// @route   DELETE /api/destinations/:id
// @access  Private/Admin
exports.deleteDestination = async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) return res.status(404).json({ success: false, message: 'Destination not found' });

    deleteFile(destination.image);
    await destination.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
