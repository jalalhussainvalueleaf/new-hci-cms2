import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
}, {
  timestamps: true
});

// Add text index for search functionality
testimonialSchema.index({ 
  name: 'text', 
  title: 'text',
  content: 'text'
});

export default mongoose.models.Testimonial || mongoose.model('Testimonial', testimonialSchema);
