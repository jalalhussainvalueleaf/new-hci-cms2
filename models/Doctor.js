import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  image: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['cardiac-sciences', 'oncology', 'neuro-sciences', 'gastroenterology', 'orthopedics'],
  },
  qualification: [{
    type: String,
    trim: true,
  }],
  experience: {
    type: String,
    required: [true, 'Experience is required'],
    trim: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  reviews: {
    type: Number,
    default: 0,
  },
  expertise: [{
    type: String,
    trim: true,
  }],
  publicationData: {
    heading: {
      type: String,
      default: 'Publications',
    },
    publications: [{
      type: String,
      trim: true,
    }],
  },
  researchData: {
    heading: {
      type: String,
      default: 'Research',
    },
    research: [{
      type: String,
      trim: true,
    }],
  },
  aboutData: {
    heading: {
      type: String,
      default: 'About',
    },
    about: {
      type: String,
      trim: true,
    },
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  reviewEnabled: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Add text index for search functionality
doctorSchema.index({ 
  name: 'text', 
  category: 'text',
  expertise: 'text',
  'aboutData.about': 'text',
});

const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);

export default Doctor;