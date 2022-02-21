const mongoose = require('mongoose');

const feedBackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A feedBack must have a title'],
    unique: true,
    trim: true,
    maxlength: [
      10,
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
    unique: true,
    trim: true,
    maxlength: [
      50,
      'A feedBack description must have less or equal than 50 characters',
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
