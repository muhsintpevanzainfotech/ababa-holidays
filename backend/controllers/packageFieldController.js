const PackageField = require('../models/PackageField');
const Service = require('../models/Service');
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all fields for a service setup
// @route   GET /api/package-fields/setup/:serviceId
// @access  Public/Private
const getFieldsByService = asyncHandler(async (req, res, next) => {
  let serviceId = req.params.serviceId;
  let service = null;

  if (mongoose.Types.ObjectId.isValid(serviceId)) {
    service = await Service.findById(serviceId);
  }
  if (!service) {
    service = await Service.findOne({ customId: serviceId });
  }

  if (service) {
    serviceId = service._id;
  }

  let fields = await PackageField.find({ 
    service: serviceId,
    isActive: true 
  }).sort('order');

  if (fields.length === 0 && service && service.formSchema && Array.isArray(service.formSchema.fields) && service.formSchema.fields.length > 0) {
    const rawFields = service.formSchema.fields || [];
    const groups = service.formSchema.groups || [];
    const layout = service.formSchema.layout || [];

    // Map group membership (setId and setTitle) for each field
    const fieldGroupMap = {};
    if (Array.isArray(groups)) {
      groups.forEach(g => {
        const gFields = g.fields || g.fieldIds || [];
        gFields.forEach(fId => {
          fieldGroupMap[fId] = {
            setId: g.id,
            setTitle: g.title || g.label || g.name || 'Section Group'
          };
        });
      });
    }

    // Determine field sequence from layout and groups
    let orderedFields = [];
    if (Array.isArray(layout) && layout.length > 0) {
      layout.forEach(itemKey => {
        const groupObj = Array.isArray(groups) ? groups.find(g => g.id === itemKey) : null;
        if (groupObj) {
          const gFieldIds = groupObj.fields || groupObj.fieldIds || [];
          gFieldIds.forEach(fId => {
            const found = rawFields.find(f => f.id === fId || f._id === fId);
            if (found && !orderedFields.some(of => (of.id && of.id === found.id) || (of._id && of._id === found._id))) {
              orderedFields.push(found);
            }
          });
        } else {
          const found = rawFields.find(f => f.id === itemKey || f._id === itemKey);
          if (found && !orderedFields.some(of => (of.id && of.id === found.id) || (of._id && of._id === found._id))) {
            orderedFields.push(found);
          }
        }
      });
    }

    // Include any remaining fields not in layout
    rawFields.forEach(f => {
      if (!orderedFields.some(of => (of.id && of.id === f.id) || (of._id && of._id === f._id))) {
        orderedFields.push(f);
      }
    });

    fields = orderedFields.map((f, idx) => {
      const fType = (f.type === 'dropdown' ? 'select' : f.type === 'file upload' ? 'upload' : (f.type || f.fieldType || 'text'));
      const groupInfo = fieldGroupMap[f.id] || fieldGroupMap[f._id] || {};
      const defaultSpan = (fType === 'textarea' || fType === 'editor' || fType === 'upload' || fType === 'map' || fType === 'section_header') ? 12 : 6;

      const colLgVal = f.colLg || f.col_lg || f.colSpan || f.col_span || f.attributes?.colLg || f.attributes?.col_lg || f.attributes?.colSpan || defaultSpan;
      const colMdVal = f.colMd || f.col_md || f.attributes?.colMd || f.attributes?.col_md || defaultSpan;
      const colSmVal = f.colSm || f.col_sm || f.attributes?.colSm || f.attributes?.col_sm || 12;
      const colXlVal = f.colXl || f.col_xl || f.attributes?.colXl || f.attributes?.col_xl || colLgVal;

      return {
        _id: f.id || f._id || `schema_${idx}`,
        service: serviceId,
        setId: groupInfo.setId || f.setId || f.set_id || (f.setTitle || f.set_title ? `set_${(f.setTitle || f.set_title).toLowerCase().replace(/[^a-z0-9]+/g, '_')}` : null),
        setTitle: groupInfo.setTitle || f.setTitle || f.set_title || f.groupTitle || f.groupLabel || null,
        setOrder: f.setOrder || f.set_order || 0,
        label: f.label || f.name || 'Custom Field',
        fieldName: f.name || f.id || `field_${idx}`,
        fieldType: fType,
        isRequired: !!f.required,
        order: idx,
        colSm: Number(colSmVal),
        colMd: Number(colMdVal),
        colLg: Number(colLgVal),
        colXl: Number(colXlVal),
        colSpan: Number(colLgVal),
        config: {
          placeholder: f.placeholder || f.attributes?.placeholder || '',
          options: f.attributes?.options || f.options || [],
          minLength: f.attributes?.minLength,
          maxLength: f.attributes?.maxLength,
          rows: f.attributes?.rows,
          multiple: f.attributes?.multiple,
          searchable: f.attributes?.searchable,
          dependsOn: f.dependsOn,
          api: f.api
        },
        isActive: true
      };
    });
  }

  res.status(200).json({
    success: true,
    count: fields.length,
    data: fields,
    service: service ? {
      _id: service._id,
      title: service.title,
      customId: service.customId,
      formSchema: service.formSchema
    } : null
  });
});

// @desc    Bulk Save / Sync all fields and schema for a service
// @route   POST /api/package-fields/setup/:serviceId
// @access  Private (Admin)
const saveFieldsForService = asyncHandler(async (req, res, next) => {
  let serviceId = req.params.serviceId;
  let serviceDoc = null;

  if (mongoose.Types.ObjectId.isValid(serviceId)) {
    serviceDoc = await Service.findById(serviceId);
  }
  if (!serviceDoc) {
    serviceDoc = await Service.findOne({ customId: serviceId });
  }

  if (!serviceDoc) {
    return next(new ErrorResponse(`Service not found for ID: ${serviceId}`, 404));
  }

  serviceId = serviceDoc._id;
  const { fields, groups, layout } = req.body;

  // 1. Update formSchema on Service
  serviceDoc.formSchema = {
    fields: fields || [],
    groups: groups || [],
    layout: layout || []
  };
  await serviceDoc.save({ validateBeforeSave: false });

  // 2. Sync PackageField collection
  await PackageField.deleteMany({ service: serviceId });

  if (fields && Array.isArray(fields)) {
    const validTypes = [
      'text', 'number', 'textarea', 'password', 'checkbox', 'radio',
      'switch', 'select', 'upload', 'tag', 'map', 'date', 'email',
      'phone', 'otp', 'location', 'payment', 'image', 'search',
      'rating', 'editor', 'feature', 'section_header', 'hero', 'features', 'pricing', 'testimonials'
    ];

    // Map group membership (setId and setTitle) for each field
    const fieldGroupMap = {};
    if (Array.isArray(groups)) {
      groups.forEach(g => {
        const gFields = g.fields || g.fieldIds || [];
        gFields.forEach(fId => {
          fieldGroupMap[fId] = {
            setId: g.id,
            setTitle: g.title || g.label || g.name || 'Section Group'
          };
        });
      });
    }

    // Determine field sequence from layout and groups
    let orderedFields = [];
    if (Array.isArray(layout) && layout.length > 0) {
      layout.forEach(itemKey => {
        const groupObj = Array.isArray(groups) ? groups.find(g => g.id === itemKey) : null;
        if (groupObj) {
          const gFieldIds = groupObj.fields || groupObj.fieldIds || [];
          gFieldIds.forEach(fId => {
            const found = fields.find(f => f.id === fId || f._id === fId);
            if (found && !orderedFields.some(of => (of.id && of.id === found.id) || (of._id && of._id === found._id))) {
              orderedFields.push(found);
            }
          });
        } else {
          const found = fields.find(f => f.id === itemKey || f._id === itemKey);
          if (found && !orderedFields.some(of => (of.id && of.id === found.id) || (of._id && of._id === found._id))) {
            orderedFields.push(found);
          }
        }
      });
    }

    // Include any remaining fields not in layout
    fields.forEach(f => {
      if (!orderedFields.some(of => (of.id && of.id === f.id) || (of._id && of._id === f._id))) {
        orderedFields.push(f);
      }
    });

    const fieldDocs = orderedFields.map((f, idx) => {
      let fType = f.type || f.fieldType || 'text';
      if (fType === 'file upload') fType = 'upload';
      if (fType === 'dropdown') fType = 'select';
      if (!validTypes.includes(fType)) fType = 'text';

      const groupInfo = fieldGroupMap[f.id] || fieldGroupMap[f._id] || {};
      const defaultSpan = (fType === 'textarea' || fType === 'editor' || fType === 'upload' || fType === 'map' || fType === 'section_header') ? 12 : 6;

      const colLgVal = f.colLg || f.col_lg || f.colSpan || f.col_span || f.attributes?.colLg || f.attributes?.col_lg || f.attributes?.colSpan || defaultSpan;
      const colMdVal = f.colMd || f.col_md || f.attributes?.colMd || f.attributes?.col_md || defaultSpan;
      const colSmVal = f.colSm || f.col_sm || f.attributes?.colSm || f.attributes?.col_sm || 12;
      const colXlVal = f.colXl || f.col_xl || f.attributes?.colXl || f.attributes?.col_xl || colLgVal;

      return {
        service: serviceId,
        setId: groupInfo.setId || f.setId || f.set_id || (f.setTitle || f.set_title ? `set_${(f.setTitle || f.set_title).toLowerCase().replace(/[^a-z0-9]+/g, '_')}` : null),
        setTitle: groupInfo.setTitle || f.setTitle || f.set_title || f.groupTitle || f.groupLabel || null,
        setOrder: f.setOrder || f.set_order || 0,
        label: f.label || 'Field Label',
        fieldName: f.name || f.id || `field_${idx}`,
        fieldType: fType,
        isRequired: !!f.required,
        order: idx,
        colSm: Number(colSmVal),
        colMd: Number(colMdVal),
        colLg: Number(colLgVal),
        colXl: Number(colXlVal),
        colSpan: Number(colLgVal),
        config: {
          placeholder: f.placeholder || f.attributes?.placeholder || '',
          options: f.attributes?.options || f.options || [],
          min: f.attributes?.min,
          max: f.attributes?.max,
          minlength: f.attributes?.minlength,
          maxlength: f.attributes?.maxlength,
          accept: f.attributes?.accept,
          multiple: f.attributes?.multiple
        },
        isActive: true
      };
    });

    if (fieldDocs.length > 0) {
      await PackageField.insertMany(fieldDocs);
    }
  }

  res.status(200).json({
    success: true,
    message: 'Package fields saved successfully',
    data: {
      serviceId,
      customId: serviceDoc.customId,
      formSchema: serviceDoc.formSchema
    }
  });
});

// @desc    Create a new field
// @route   POST /api/package-fields
// @access  Private (Admin)
const createField = asyncHandler(async (req, res, next) => {
  const { service, fieldName } = req.body;

  // Check if fieldName exists for this service
  const existingField = await PackageField.findOne({ service, fieldName });
  if (existingField) {
    return next(new ErrorResponse(`Field name '${fieldName}' already exists for this service`, 400));
  }

  const field = await PackageField.create(req.body);

  res.status(201).json({
    success: true,
    data: field
  });
});

// @desc    Update a field
// @route   PUT /api/package-fields/:id
// @access  Private (Admin)
const updateField = asyncHandler(async (req, res, next) => {
  let field = await PackageField.findById(req.params.id);

  if (!field) {
    return next(new ErrorResponse(`Field not found with id of ${req.params.id}`, 404));
  }

  field = await PackageField.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: field
  });
});

// @desc    Delete a field
// @route   DELETE /api/package-fields/:id
// @access  Private (Admin)
const deleteField = asyncHandler(async (req, res, next) => {
  const field = await PackageField.findById(req.params.id);

  if (!field) {
    return next(new ErrorResponse(`Field not found with id of ${req.params.id}`, 404));
  }

  await field.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Bulk update order
// @route   PUT /api/package-fields/reorder
// @access  Private (Admin)
const reorderFields = asyncHandler(async (req, res, next) => {
  const { fields } = req.body; // Array of { id, order }

  if (!fields || !Array.isArray(fields)) {
    return next(new ErrorResponse('Fields array is required', 400));
  }

  const updatePromises = fields.map(f => 
    PackageField.findByIdAndUpdate(f.id, { order: f.order })
  );

  await Promise.all(updatePromises);

  res.status(200).json({
    success: true,
    message: 'Fields reordered successfully'
  });
});

module.exports = {
  getFieldsByService,
  saveFieldsForService,
  createField,
  updateField,
  deleteField,
  reorderFields
};
