import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  excerpt: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  metaTitle: {
    type: String,
    trim: true,
  },
  metaDescription: {
    type: String,
    trim: true,
  },
  featuredImage: {
    type: String,
    default: '',
  },
  template: {
    type: String,
    default: 'default',
  },
  allowComments: {
    type: Boolean,
    default: true,
  },
  author: {
    type: String,
    default: 'Admin',
  },
  // Add any additional fields specific to pages
  // that might not be in posts
  parentPage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Page',
    default: null,
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Add text index for search functionality
pageSchema.index({ 
  title: 'text', 
  content: 'text',
  excerpt: 'text',
  metaTitle: 'text',
  metaDescription: 'text',
});

// Pre-save hook to generate slug from title if not provided
pageSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/\s+/g, '-')     // Replace spaces with -
      .replace(/[^\w-]+/g, '')  // Remove all non-word chars
      .replace(/--+/g, '-')      // Replace multiple - with single -
      .replace(/^-+/, '')        // Trim - from start of text
      .replace(/-+$/, '');       // Trim - from end of text
  }
  next();
});

// Check if model already exists before compiling
const Page = mongoose.models.Page || mongoose.model('Page', pageSchema);

export default Page;
