const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a blog title'],
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    unique: true
  },
  content: {
    type: String,
    required: [true, 'Please add blog content']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    default: '/public/defaults/default_travel.png'
  },
  category: {
    type: String
  },
  seo: {
    title: { type: String },
    description: { type: String },
    keywords: [{ type: String }]
  },
  status: {
    type: String,
    enum: ['Draft', 'Published'],
    default: 'Draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isTopPick: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create slug from title before saving
blogSchema.pre('save', async function() {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
});

module.exports = mongoose.model('Blog', blogSchema);
