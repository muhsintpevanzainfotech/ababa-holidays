const Country = require('../models/Country');
const State = require('../models/State');
const Destination = require('../models/Destination');
const fs = require('fs');
const path = require('path');

// Helper to delete file
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

// @desc    Get all countries
// @route   GET /api/countries
// @access  Public
exports.getCountries = async (req, res, next) => {
  try {
    const countries = await Country.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: countries.length, data: countries });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single country
// @route   GET /api/countries/:id
// @access  Public
exports.getCountry = async (req, res, next) => {
  try {
    const country = await Country.findById(req.params.id);
    if (!country) return res.status(404).json({ success: false, message: 'Country not found' });
    res.status(200).json({ success: true, data: country });
  } catch (error) {
    next(error);
  }
};

// @desc    Create country
// @route   POST /api/countries
// @access  Private/Admin
exports.createCountry = async (req, res, next) => {
  try {
    if (req.file) {
      req.body.image = `uploads/${req.file.filename}`;
    }
    const country = await Country.create(req.body);
    res.status(201).json({ success: true, data: country });
  } catch (error) {
    if (req.file) deleteFile(`uploads/${req.file.filename}`);
    next(error);
  }
};

// @desc    Update country
// @route   PUT /api/countries/:id
// @access  Private/Admin
exports.updateCountry = async (req, res, next) => {
  try {
    let country = await Country.findById(req.params.id);
    if (!country) return res.status(404).json({ success: false, message: 'Country not found' });

    if (req.file) {
      deleteFile(country.image);
      req.body.image = `uploads/${req.file.filename}`;
    }

    country = await Country.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: country });
  } catch (error) {
    if (req.file) deleteFile(`uploads/${req.file.filename}`);
    next(error);
  }
};

// @desc    Delete country
// @route   DELETE /api/countries/:id
// @access  Private/Admin
exports.deleteCountry = async (req, res, next) => {
  try {
    const country = await Country.findById(req.params.id);
    if (!country) return res.status(404).json({ success: false, message: 'Country not found' });

    // Check if states exist for this country
    const states = await State.find({ country: req.params.id });
    if (states.length > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete country with associated states' });
    }

    deleteFile(country.image);
    await country.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
