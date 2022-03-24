const mongoose = require('mongoose');

const objectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A model must have a name'],
    trim: true,
    maxlength: [50, 'A model name must have less or equal than 50 characters'],
    minlength: [3, 'A model name must have more or equal than 3 characters'],
  },
  modelfbx: {
    type: [String],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    required: [true, "A Model must Have a description"],
  },
  imageCover: {
    type: String,
    default: 'no-image.png',
  },
  images: [String],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Model must belong to a user.'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
});

const Object = mongoose.model('Object', objectSchema);

module.exports = Object;
