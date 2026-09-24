const Role = require('../models/Role');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// Default Seed Roles
const defaultRoles = [
  {
    name: 'Administrator (Super Admin)',
    badge: 'ADMINISTRATOR',
    color: '#4f46e5',
    description: 'Unrestricted 100% full system administrator authority. Bypasses all module permission gates and manages administrative settings, passkeys, policies, and staff users.',
    isSystem: true,
    permissions: ['ALL']
  },
  {
    name: 'Operations & Catalog Manager',
    badge: 'OPERATIONS',
    color: '#8b5cf6',
    description: 'Manages tour package itineraries, services catalog, destinations, bookings, and AI form builders.',
    isSystem: false,
    permissions: ['manage_dashboard', 'manage_packages', 'manage_services', 'manage_destinations', 'manage_bookings', 'manage_ai_builder']
  },
  {
    name: 'Vendor Relationship Manager',
    badge: 'VENDOR HUB',
    color: '#3b82f6',
    description: 'Approves vendor agency registrations, subscription plans, vendor staff sub-accounts, and dispute resolution.',
    isSystem: false,
    permissions: ['manage_vendors', 'manage_subscriptions', 'manage_vendor_staff', 'manage_complaints', 'manage_enquiries']
  },
  {
    name: 'Finance & Accounts Executive',
    badge: 'FINANCE',
    color: '#10b981',
    description: 'Access payment transaction records, financial payout auditing, subscription revenue, and CSV exports.',
    isSystem: false,
    permissions: ['manage_dashboard', 'manage_payments', 'manage_subscriptions', 'manage_bookings', 'manage_exports']
  },
  {
    name: 'Content & CMS Specialist',
    badge: 'CMS & MEDIA',
    color: '#f59e0b',
    description: 'Curates homepage promo banners, travel blogs, traveler reviews moderation, reels, and brand logos.',
    isSystem: false,
    permissions: ['manage_banners', 'manage_blogs', 'manage_testimonials', 'manage_reels', 'manage_brands']
  },
  {
    name: 'Support & Leads Executive',
    badge: 'CUSTOMER LEADS',
    color: '#ec4899',
    description: 'Handles customer trip request enquiries, contact form messages, support disputes, and traveler profiles.',
    isSystem: false,
    permissions: ['manage_users', 'manage_enquiries', 'manage_contact_us', 'manage_complaints']
  }
];

// @desc    Get all system roles (auto-seeds if empty)
// @route   GET /api/roles
// @access  Private
const getRoles = asyncHandler(async (req, res, next) => {
  let roles = await Role.find({});

  if (roles.length === 0) {
    console.log('Seeding default system roles into database...');
    roles = await Role.insertMany(defaultRoles);
  }

  res.json({
    success: true,
    count: roles.length,
    data: roles
  });
});

// @desc    Create a new role
// @route   POST /api/roles
// @access  Private/Admin
const createRole = asyncHandler(async (req, res, next) => {
  const { name, badge, color, description, permissions } = req.body;

  const existingRole = await Role.findOne({ name });
  if (existingRole) {
    return next(new ErrorResponse('Role with this name already exists', 400));
  }

  const role = await Role.create({
    name,
    badge: badge || 'CUSTOM ROLE',
    color: color || '#4f46e5',
    description: description || '',
    isSystem: false,
    permissions: permissions || []
  });

  res.status(201).json({
    success: true,
    data: role
  });
});

// @desc    Update a role
// @route   PUT /api/roles/:id
// @access  Private/Admin
const updateRole = asyncHandler(async (req, res, next) => {
  let role = await Role.findById(req.params.id);

  if (!role) {
    return next(new ErrorResponse('Role not found', 404));
  }

  if (role.isSystem) {
    return next(new ErrorResponse('System core roles cannot be modified', 400));
  }

  const { name, badge, color, description, permissions } = req.body;

  role.name = name || role.name;
  role.badge = badge || role.badge;
  role.color = color || role.color;
  role.description = description || role.description;
  if (permissions) role.permissions = permissions;

  await role.save();

  res.json({
    success: true,
    data: role
  });
});

// @desc    Delete a role
// @route   DELETE /api/roles/:id
// @access  Private/Admin
const deleteRole = asyncHandler(async (req, res, next) => {
  const role = await Role.findById(req.params.id);

  if (!role) {
    return next(new ErrorResponse('Role not found', 404));
  }

  if (role.isSystem) {
    return next(new ErrorResponse('System core roles cannot be deleted', 400));
  }

  await role.deleteOne();

  res.json({
    success: true,
    message: 'Role deleted successfully'
  });
});

module.exports = {
  getRoles,
  createRole,
  updateRole,
  deleteRole
};
