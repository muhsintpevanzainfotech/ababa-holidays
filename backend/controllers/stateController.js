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
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status && req.query.status !== 'all') {
      filter.isActive = req.query.status === 'active';
    }
    if (req.query.country && req.query.country !== 'all') {
      filter.country = req.query.country;
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { code: { $regex: req.query.search, $options: 'i' } },
        { slug: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const total = await State.countDocuments(filter);
    
    let states;
    if (req.query.all === 'true') {
      states = await State.find(filter).populate('country', 'name flag code').sort({ name: 1 });
    } else {
      states = await State.find(filter)
        .populate('country', 'name flag code')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit);
    }

    res.status(200).json({ 
      success: true, 
      count: states.length, 
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: states 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get states by country
// @route   GET /api/states/country/:countryId
// @access  Public
exports.getStatesByCountry = async (req, res, next) => {
  try {
    const states = await State.find({ 
      $or: [{ country: req.params.countryId }, { countryId: req.params.countryId }] 
    }).sort({ name: 1 });
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
    const state = await State.findById(req.params.id).populate('country', 'name flag code');
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
      const filePath = req.file.path.replace(/\\/g, '/');
      req.body.coverImage = filePath;
      req.body.image = filePath;
    }

    if (req.body.countryId && !req.body.country) {
      req.body.country = req.body.countryId;
    } else if (req.body.country && !req.body.countryId) {
      req.body.countryId = req.body.country;
    }

    if (req.body.name && !req.body.slug) {
      req.body.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    let state = await State.create(req.body);
    state = await state.populate('country', 'name flag code');
    res.status(201).json({ success: true, data: state });
  } catch (error) {
    if (req.file) deleteFile(req.file.path);
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
      deleteFile(state.coverImage || state.image);
      const filePath = req.file.path.replace(/\\/g, '/');
      req.body.coverImage = filePath;
      req.body.image = filePath;
    }

    if (req.body.countryId && !req.body.country) {
      req.body.country = req.body.countryId;
    } else if (req.body.country && !req.body.countryId) {
      req.body.countryId = req.body.country;
    }

    if (req.body.name && !req.body.slug) {
      req.body.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    state = await State.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true
    }).populate('country', 'name flag code');

    res.status(200).json({ success: true, data: state });
  } catch (error) {
    if (req.file) deleteFile(req.file.path);
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
