const Comment = require('../models/commentModel');
const AppError = require('../utils/appError');
const Visit = require('../models/VisitModel');
const catchasync = require('../utils/catchAsync');
const mongoose = require('mongoose');

exports.createComment = catchasync(async (req, res, next) => {
  const visit = await Visit.findById(req.body.visit);
  if (!visit) {
    return next(new AppError('No visit found with that ID', 404));
  }

  let user = [];

  if (req.user.id === visit.userOwner._id.valueOf()) {
    user.push(visit.userOwner);
  } else {
    user = await Visit.find({
      _id: req.body.visit,
      users: { _id: mongoose.Types.ObjectId(req.user.id) },
    });
  }

  if (user.length <= 0) {
    return next(new AppError('User is not in visit', 404));
  }

  const newComment = await Comment.create({
    description: req.body.description,
    user: req.user.id,
    visit: req.body.visit,
  });

  res.status(201).json({ status: 'success', data: { comment: newComment } });
});

exports.getCommentById = catchasync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id).select('-__v');

  res.status(201).json({ status: 'success', comment });
});

exports.deleteComment = catchasync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id).select('-__v');

  if (
    comment.user._id.toString() !==
    mongoose.Types.ObjectId(req.user.id).toString()
    && req.user.role.localeCompare("admin") !== 0
  ) {
    return next(new AppError('You have no access to delete this comment', 401));
  }

  await Comment.findByIdAndDelete(req.params.id);

  res.status(201).json({ status: 'success', data: null });
});
