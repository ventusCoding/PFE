const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
  {
    userOwner: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A visit must belong to a user.'],
    },
    users: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    modelfbx: {
      type: mongoose.Schema.ObjectId,
      ref: 'Object',
      required: [true, 'A visit must belong to an object.'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

visitSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'userOwner',
    select: 'name photo',
  }).populate({
    path: 'users',
    select: 'name photo',
  });

  next();
});

visitSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'visit',
  localField: '_id',
});

const Visit = mongoose.model('Visit', visitSchema);

module.exports = Visit;
