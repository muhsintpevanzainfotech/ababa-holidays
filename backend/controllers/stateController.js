const State = require('../models/State');
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

// @desc    Get all states
// @route   GET /api/states
// @access  Public
exports.getStates = async (req, res, next) => {
  try {
    const states = await State.find().populate('country', 'name').sort({ name: 1 });
    res.status(200).json({ success: true, count: states.length, data: states });
  } catch (error) {
    next(error);
  }
};

// @desc    Get states by country
// @route   GET /api/states/country/:countryId
// @access  Public
exports.getStatesByCountry = async (req, res, next) => {
  try {
    const states = await State.find({ country: req.params.countryId }).sort({ name: 1 });
    res.status(200).json({ success: true, count: states.length, data: states });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single state
// @route   GET /api/states/:id
// @access  Public
exports.getState = async (req, res, next) => {
  try {
    const state = await State.findById(req.params.id).populate('country', 'name');
    if (!state) return res.status(404).json({ success: false, message: 'State not found' });
    res.status(200).json({ success: true, data: state });
  } catch (error) {
    next(error);
  }
};

// @desc    Create state
// @route   POST /api/states
// @access  Private/Admin
exports.createState = async (req, res, next) => {
  try {
    if (req.file) {
      req.body.image = `uploads/${req.file.filename}`;
    }
    const state = await State.create(req.body);
    res.status(201).json({ success: true, data: state });
  } catch (error) {
    if (req.file) deleteFile(`uploads/${req.file.filename}`);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'This state name already exists in the selected country' });
    }
    next(error);
  }
};

// @desc    Update state
// @route   PUT /api/states/:id
// @access  Private/Admin
exports.updateState = async (req, res, next) => {
  try {
    let state = await State.findById(req.params.id);
    if (!state) return res.status(404).json({ success: false, message: 'State not found' });

    if (req.file) {
      deleteFile(state.image);
      req.body.image = `uploads/${req.file.filename}`;
    }

    state = await State.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: state });
  } catch (error) {
    if (req.file) deleteFile(`uploads/${req.file.filename}`);
    next(error);
  }
};

// @desc    Delete state
// @route   DELETE /api/states/:id
// @access  Private/Admin
exports.deleteState = async (req, res, next) => {
  try {
    const state = await State.findById(req.params.id);
    if (!state) return res.status(404).json({ success: false, message: 'State not found' });

    // Check if destinations exist
    const destinations = await Destination.find({ state: req.params.id });
    if (destinations.length > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete state with associated destinations' });
    }

    deleteFile(state.image);
    await state.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
