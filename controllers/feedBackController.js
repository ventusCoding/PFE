const FeedBack = require('../models/feedBackModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchasync = require('../utils/catchAsync');

exports.createFeedBack = catchasync(async (req, res, next) => {

  const newFeedback = await FeedBack.create({
    title: req.body.title,
    description: req.body.description,
    user: req.user,
  });

  res.status(201).json({ status: 'success', data: { feedback: newFeedback } });
});

exports.getFeedBackById = catchasync(async (req, res, next) => {
  const feedback = await FeedBack.findById(req.params.id);

  if (!feedback) {
    return next(new AppError('No feedback found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { feedback } });
});

exports.getAllFeedBacks = catchasync(async (req, res, next) => {
  const features = new APIFeatures(FeedBack.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const feedbacks = await features.query;

  if (feedbacks.length > 0) {
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: feedbacks.length,
      data: {
        feedbacks,
      },
    });
  } else {
    res.status(404).json({
      status: 'fail',
      results: 0,
      data: {
        feedbacks,
      },
      message: 'No Data Found!',
    });
  }
});
