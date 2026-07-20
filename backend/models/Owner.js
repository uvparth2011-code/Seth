/**
 * Owner Model
 * Stores property owner information
 */

const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /.+\@.+\..+/
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    // Store without country code for flexibility
    trim: true
  },
  whatsappNumber: {
    type: String,
    required: true,
    unique: true,
    // Format: country code + number (e.g., 919876543210)
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  propertyType: {
    type: String,
    enum: ['Residential', 'Commercial', 'Both'],
    default: 'Residential'
  },
  properties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }],
  messagesReceived: {
    type: Number,
    default: 0
  },
  lastMessageSent: {
    type: Date
  },
  interested: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
ownerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Owner', ownerSchema);
