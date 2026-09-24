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

const populateOptions = [
  {
    path: 'state',
    select: 'name code flag country',
    populate: {
      path: 'country',
      select: 'name flag code'
    }
  },
  {
    path: 'country',
    select: 'name flag code'
  }
];

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
      filter.$or = [{ state: req.query.state }, { stateId: req.query.state }];
    }
    if (req.query.country && req.query.country !== 'all') {
      filter.$or = [{ country: req.query.country }, { countryId: req.query.country }];
    }
    if (req.query.category && req.query.category !== 'all') {
      filter.categories = req.query.category;
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { slug: { $regex: req.query.search, $options: 'i' } },
        { city: { $regex: req.query.search, $options: 'i' } },
        { address: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const total = await Destination.countDocuments(filter);
    
    let destinations;
    if (req.query.all === 'true') {
      destinations = await Destination.find(filter)
        .populate(populateOptions)
        .sort({ name: 1 });
    } else {
      destinations = await Destination.find(filter)
        .populate(populateOptions)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit);
    }

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
    const destinations = await Destination.find({ 
      $or: [{ state: req.params.stateId }, { stateId: req.params.stateId }] 
    }).populate(populateOptions).sort({ name: 1 });
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
    const destination = await Destination.findById(req.params.id).populate(populateOptions);
    if (!destination) return res.status(404).json({ success: false, message: 'Destination not found' });
    res.status(200).json({ success: true, data: destination });
  } catch (error) {
    next(error);
  }
};

// Helper to sanitize payload body
const processPayload = (body, reqFiles, singleFile) => {
  if (singleFile) {
    const filePath = singleFile.path.replace(/\\/g, '/');
    body.coverImage = filePath;
    body.image = filePath;
    body.thumbnail = filePath;
  }

  if (reqFiles) {
    if (reqFiles.coverImage?.[0]) {
      const p = reqFiles.coverImage[0].path.replace(/\\/g, '/');
      body.coverImage = p;
      body.image = p;
    }
    if (reqFiles.thumbnail?.[0]) {
      body.thumbnail = reqFiles.thumbnail[0].path.replace(/\\/g, '/');
    }
    if (reqFiles.gallery) {
      body.gallery = reqFiles.gallery.map(f => f.path.replace(/\\/g, '/'));
    }
  }

  if (body.stateId && !body.state) body.state = body.stateId;
  if (body.state && !body.stateId) body.stateId = body.state;
  if (body.countryId && !body.country) body.country = body.countryId;
  if (body.country && !body.countryId) body.countryId = body.country;

  if (body.name && !body.slug) {
    body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }

  if (typeof body.categories === 'string') {
    try {
      body.categories = JSON.parse(body.categories);
    } catch (e) {
      body.categories = body.categories.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  return body;
};

// @desc    Create destination
// @route   POST /api/destinations
// @access  Private/Admin
exports.createDestination = async (req, res, next) => {
  try {
    const payload = processPayload(req.body, req.files, req.file);
    let destination = await Destination.create(payload);
    destination = await destination.populate(populateOptions);
    res.status(201).json({ success: true, data: destination });
  } catch (error) {
    if (req.file) deleteFile(req.file.path);
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

    if (req.file || req.files?.coverImage) {
      deleteFile(destination.coverImage || destination.image);
    }

    const payload = processPayload(req.body, req.files, req.file);

    destination = await Destination.findByIdAndUpdate(req.params.id, payload, {
      returnDocument: 'after',
      runValidators: true
    }).populate(populateOptions);

    res.status(200).json({ success: true, data: destination });
  } catch (error) {
    if (req.file) deleteFile(req.file.path);
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

    deleteFile(destination.coverImage || destination.image);
    deleteFile(destination.thumbnail);
    if (Array.isArray(destination.gallery)) {
      destination.gallery.forEach(f => deleteFile(f));
    }

    await destination.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
