const VisitModel = require('../models/VisitModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchasync = require('../utils/catchAsync');
const ModelObject = require('../models/objectModel');
const User = require('../Models/userModel');

exports.getAllVisits = catchasync(async (req, res, next) => {
  const features = new APIFeatures(VisitModel.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const visits = await features.query;

  if (visits.length > 0) {
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: visits.length,
      data: {
        visits,
      },
    });
  } else {
    res.status(404).json({
      status: 'fail',
      results: 0,
      data: {
        visits,
      },
      message: 'No Data Found!',
    });
  }
});

exports.createVisit = catchasync(async (req, res, next) => {
  const model = await ModelObject.find({ _id: req.body.modelfbx });

  if (!model) {
    return next(new AppError('No object found with that ID', 404));
  }

  console.log(model[0].user);
  console.log(req.user._id.toString());

  if (model[0].user.toString() !== req.user._id.toString()) {
    return next(
      new AppError('You are not authorized to access this object', 401)
    );
  }

  const newVisit = await VisitModel.create({
    userOwner: req.user,
    modelfbx: req.body.modelfbx,
  });

  res.status(201).json({ status: 'success', data: { visit: newVisit } });
});

exports.addUserToVisit = catchasync(async (req, res, next) => {
  if (!req.body.user) {
    return next(new AppError('You need to choose a user to add it.', 404));
  }

  const user = await User.findById(req.body.user);

  if (!user) {
    return next(new AppError('No user found with that id.', 404));
  }

  const visit = await VisitModel.findById(req.params.id);

  if (!visit) {
    return next(new AppError('No object found with that ID', 404));
  }

  if (visit.userOwner.toString() !== req.user._id.toString()) {
    return next(
      new AppError('You are not authorized to access this visit', 401)
    );
  }

  if (visit.users.includes(user._id)) {
    return next(new AppError('This user is already in this visit.', 404));
  }

  visit.users.push(req.body.user);

  const updatedVisit = await visit.save();

  res.status(200).json({ status: 'success', data: { visit: updatedVisit } });
});

exports.getVisitById = catchasync(async (req, res, next) => {
  const visit = await VisitModel.findById(req.params.id);

  if (!visit) {
    return next(new AppError('No object found with that ID', 404));
  }

  if (visit.userOwner.toString() !== req.user._id.toString()) {
    return next(
      new AppError('You are not authorized to access this visit', 401)
    );
  }

  res.status(200).json({ status: 'success', data: { visit } });
});

exports.getCurrentUserVisits = catchasync(async (req, res, next) => {
    const features = new APIFeatures(
        VisitModel.find({ userOwner: req.user._id }),
        req.query
      )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const visits = await features.query;

  if (visits.length > 0) {
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: visits.length,
      data: {
        visits,
      },
    });
  } else {
    res.status(404).json({
      status: 'fail',
      results: 0,
      data: {
        visits,
      },
      message: 'No Data Found!',
    });
  }
});

exports.deleteUserFromVisit = catchasync(async (req, res, next) => {

  if (!req.body.user) {
    return next(new AppError('You need to choose a user to remove it.', 404));
  }

  const user = await User.findById(req.body.user);

  if (!user) {
    return next(new AppError('No user found with that id.', 404));
  }

  const visit = await VisitModel.findById(req.params.id);

  if (!visit) {
    return next(new AppError('No object found with that ID', 404));
  }

  if (visit.userOwner.toString() !== req.user._id.toString()) {
    return next(
      new AppError('You are not authorized to access this visit', 401)
    );
  }

  visit.users = visit.users.filter((user) => user.toString() !== req.body.user);

  const updatedVisit = await visit.save();

  res.status(200).json({ status: 'success', data: { visit: updatedVisit } });
});