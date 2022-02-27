const mongoose = require('mongoose');

const feedBackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A feedBack must have a title'],
    trim: true,
    maxlength: [
      30,
      'A feedBack title must have less or equal than 10 characters',
    ],
    minlength: [
      3,
      'A feedBack title must have more or equal than 3 characters',
    ],
  },
  description: {
    type: String,
    required: [true, 'A feedBack must have a description'],
    trim: true,
    maxlength: [
      255,
      'A feedBack description must have less or equal than 255 characters',
    ],
    minlength: [
      10,
      'A feedBack description must have more or equal than 10 characters',
    ],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'FeedBack must belong to a user.'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
});

const FeedBack = mongoose.model('FeedBack', feedBackSchema);

module.exports = FeedBack;