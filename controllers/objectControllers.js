const ModelObject = require('../models/objectModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchasync = require('../utils/catchAsync');

exports.createObject = catchasync(async (req, res, next) => {
  const newObj = await ModelObject.create(req.body);

  res.status(201).json({ status: 'success', data: { object: newObj } });
});

exports.getObjectById = catchasync(async (req, res, next) => {
  const object = await ModelObject.findById(req.params.id);

  if (!object) {
    return next(new AppError('No object found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { object } });
});

exports.updateObject = catchasync(async (req, res, next) => {
  const object = await ModelObject.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!object) {
    return next(new AppError('No object found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { object } });
});

exports.deleteObject = catchasync(async (req, res, next) => {
  const object = await ModelObject.findByIdAndDelete(req.params.id);

  if (!object) {
    return next(new AppError('No object found with that ID', 404));
  }

  res.status(204).json({ status: 'success', data: null });
});

exports.getAllObjects = catchasync(async (req, res, next) => {
  const features = new APIFeatures(ModelObject.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const objects = await features.query;

  if (objects.length > 0) {
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: objects.length,
      data: {
        objects,
      },
    });
  } else {
    res.status(404).json({
      status: 'fail',
      results: 0,
      data: {
        objects,
      },
      message: 'No Data Found!',
    });
  }
});