const VisitModel = require('../models/VisitModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchasync = require('../utils/catchAsync');
const ModelObject = require('../models/objectModel');
const CommentModel = require('../models/commentModel');
const User = require('../Models/userModel');
const mongoose = require('mongoose');

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


  if (model[0].user.toString() !== req.user._id.toString()) {
    return next(
      new AppError('You are not authorized to access this object', 401)
    );
  }

  const newVisit = await VisitModel.create({
    userOwner: req.user,
    modelfbx: req.body.modelfbx,
    name: req.body.name,
    description: req.body.description,
  });

  res.status(201).json({ status: 'success', data: { visit: newVisit } });
});

exports.addUsersToVisit = catchasync(async (req, res, next) => {
  if (!req.body.users) {
    return next(new AppError('You need to choose a users to add them.', 400));
  }

  if (!req.body.visit) {
    return next(new AppError('You need to choose a visit', 400));
  }

  const visit = await VisitModel.findById(req.body.visit);

  if (!visit) {
    return next(new AppError('No visit found with that ID', 404));
  }

  if (visit.userOwner._id.toString() !== req.user._id.toString()) {
    return next(
      new AppError('You are not authorized to access this visit', 401)
    );
  }

  const users = await User.find({ _id: { $in: req.body.users } });

  if (users.length === 0) {
    return next(new AppError('Users Not found', 404));
  }

  //check if user add himself

  if (users.some((user) => user._id.toString() === req.user._id.toString())) {
    return next(new AppError('You can not add yourself', 404));
  }

  //check if there is user that already added to visit
  const usersToAdd = users.filter(
    (user) =>
      !visit.users.find(
        (visitUser) => user._id.toString() === visitUser._id.toString()
      )
  );

  visit.users.push(...usersToAdd);

  await visit.save();

  res.status(201).json({ status: 'success', data: { visit } });
});

exports.getVisitById = catchasync(async (req, res, next) => {
  const visit = await VisitModel.findById(req.params.id).populate('comments');

  if (!visit) {
    return next(new AppError('No object found with that ID', 404));
  }

  if (req.user.role.localeCompare('admin') !== 0) {
    let user = [];

    if (req.user._id.valueOf() === visit.userOwner._id.valueOf()) {
      user.push(visit.userOwner);
    } else {
      user = await VisitModel.find({
        _id: req.params.id,
        users: { _id: mongoose.Types.ObjectId(req.user._id.valueOf()) },
      });
    }



    if (user.length <= 0) {
      return next(new AppError('User is not in visit', 404));
    }
  }

  res.status(200).json({ status: 'success', data: { visit } });
});

exports.getBelongVisits = catchasync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  const visits = await VisitModel.find({
    users: { _id: mongoose.Types.ObjectId(req.user._id.valueOf()) },
  });

  res.status(200).json({ status: 'success', data: { visits } });
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
  if (!req.body.users || req.body.users.length <= 0) {
    return next(
      new AppError('You need to choose a users to remove them.', 400)
    );
  }

  const visit = await VisitModel.findById(req.body.visit);

  if (!visit) {
    return next(new AppError('No Visit found with that ID', 404));
  }

  if (
    visit.userOwner._id.toString() !== req.user._id.toString() &&
    req.user.role.localeCompare('admin') !== 0
  ) {
    return next(
      new AppError('You are not authorized to access this visit', 401)
    );
  }

  visit.users = containsAny(visit.users, req.body.users);

  await VisitModel.findByIdAndUpdate(req.body.visit, visit);

  res.status(200).json({ status: 'success', data: { visit: visit } });
});

exports.updateVisit = catchasync(async (req, res, next) => {
  const visit = await VisitModel.findById(req.params.id);
  

  if (!visit) {
    return next(new AppError('No Visit found with that ID', 404));
  }

  if (visit.userOwner._id.toString() !== req.user._id.toString()) {
    return next(
      new AppError('You are not authorized to access this visit', 401)
    );
  }

  visit.name = req.body.name;
  visit.description = req.body.description;

  await visit.save();

  res.status(200).json({ status: 'success', data: { visit } });

});

exports.deleteVisit = catchasync(async (req, res, next) => {
  const visit = await VisitModel.findById(req.params.id);

  if (!visit) {
    return next(new AppError('No Visit found with that ID', 404));
  }

  if (
    visit.userOwner._id.toString() !== req.user._id.toString() &&
    req.user.role.localeCompare('admin') !== 0
  ) {
    return next(
      new AppError('You are not authorized to access this visit', 401)
    );
  }

  await VisitModel.findByIdAndDelete(req.params.id);

  await CommentModel.deleteMany({ visit: req.params.id });

  res.status(204).json({ status: 'success', data: null });
});

function containsAny(source, target) {
  var result = source.filter(function (item) {

    return !(target.indexOf(item._id.toHexString()) > -1);
  });
  return result;
}
