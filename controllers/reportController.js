const Report = require('../models/reportModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchasync = require('../utils/catchAsync');
const multer = require('multer');
const sharp = require('sharp');
const { uuid } = require('uuidv4');
const User = require('../Models/userModel');
const Comment = require('../models/commentModel');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadReportImage = upload.single('image');

exports.resizeReportImage = catchasync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `report-${req.user.name}-${uuid()}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/reports/${req.file.filename}`);

  next();
});

exports.createreport = catchasync(async (req, res, next) => {
  let newReport = {};

  if (req.body.type === 'bug') {
    if (!req.body.bugType) {
      return next(new AppError('Report must belong to a bug.', 400));
    }

    const bugValues = ['Technical problem', 'Access problem', 'Other'];

    if (!(bugValues.indexOf(req.body.bugType) >= 0)) {
      return next(
        new AppError(`Bug type need to be in this values : ${bugValues}`, 400)
      );
    }

    newReport = {
      type: req.body.type,
      reportUser:req.user.id,
      bugType: req.body.bugType,
      description: req.body.description,
    };
  }

  if (req.body.type === 'comment') {
    if (!req.body.comment) {
      return next(new AppError('Report must belong to a comment.', 400));
    }

    const comment = await Comment.findById(req.body.comment);

    if (!comment) {
      return next(new AppError('No comment found with that id', 404));
    }

    newReport = {
      type: req.body.type,
      reportUser:req.user.id,
      description: req.body.description,
      comment: req.body.comment,
    };
  }

  if (req.body.type === 'user') {
    if (!req.body.user) {
      return next(new AppError('Report must belong to a user.', 400));
    }

    const user = await User.findById(req.body.user);

    if (!user) {
      return next(new AppError('No user found with that id', 404));
    }

    newReport = {
      type: req.body.type,
      reportUser:req.user.id,
      description: req.body.description,
      user: req.body.user,
    };
  }

  if (Object.keys(newReport).length === 0) {
    return next(new AppError('Nothing to Report', 404));
  }

  if (req.file) {
    newReport.image = req.file.filename;
  }

  const report = await Report.create(newReport);

  res.status(201).json({ status: 'success', data: { report } });
});

exports.getreportById = catchasync(async (req, res, next) => {
  const feedback = await FeedBack.findById(req.params.id);

  if (!feedback) {
    return next(new AppError('No feedback found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { feedback } });
});

exports.getAllreports = catchasync(async (req, res, next) => {
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
