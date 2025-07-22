import mongoose from 'mongoose';

const doctorCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '#3B82F6', // Default blue color
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  doctorCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Add text index for search functionality
doctorCategorySchema.index({ 
  name: 'text', 
  description: 'text',
});

// Pre-save hook to generate slug from name if not provided
doctorCategorySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }
  next();
});

const DoctorCategory = mongoose.models.DoctorCategory || mongoose.model('DoctorCategory', doctorCategorySchema);

export default DoctorCategory;