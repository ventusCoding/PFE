const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      trim: true,
      maxlength: [
        255,
        'A model name must have less or equal than 255 characters',
      ],
      minlength: [1, 'A model name must have more or equal than 1 character'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Comment must belong to a user.'],
    },
    image: {
      type: String,
    },
    visit: {
      type: mongoose.Schema.ObjectId,
      ref: 'Visit',
      required: [true, 'Comment must belong to a visit.'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
