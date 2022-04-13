const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A visit must have a name'],
      trim: true,
      maxlength: [50, 'A visit name must have less or equal than 50 characters'],
      minlength: [3, 'A visit name must have more or equal than 3 characters'],
    },
    description: {
      type: String,
      trim: true,
      required: [true, "A visit must Have a description"],
    },
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

visitSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'modelfbx',
    select: 'name imageCover images modelfbx',
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
