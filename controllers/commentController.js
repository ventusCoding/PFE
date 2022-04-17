const Comment = require('../models/commentModel');
const AppError = require('../utils/appError');
const Visit = require('../models/VisitModel');
const catchasync = require('../utils/catchAsync');
const mongoose = require('mongoose');
const { uuid } = require('uuidv4');
const multer = require('multer');
const sharp = require('sharp');

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

exports.uploadCommentPhoto = upload.single('image');

exports.resizeCommentPhoto = catchasync(async (req, res, next) => {
  if (!req.file) return next();

  if (req.user) {
    req.file.filename = `comment-${req.user.name}-${
      req.user.id
    }-${Date.now()}.jpeg`;
  } else {
    req.file.filename = `comment-${uuid()}-${Date.now()}.jpeg`;
  }



  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/comments/${req.file.filename}`);

  next();
});

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

  let newComment = {}


  if(req.body.description){

    newComment.description = req.body.description;
  }


  if (req.file) {
    newComment.image = req.file.filename;
  }

  newComment.visit = req.body.visit;
  newComment.user = req.user.id;

  await Comment.create(newComment);

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
      mongoose.Types.ObjectId(req.user.id).toString() &&
    req.user.role.localeCompare('admin') !== 0
  ) {
    return next(new AppError('You have no access to delete this comment', 401));
  }

  await Comment.findByIdAndDelete(req.params.id);

  res.status(201).json({ status: 'success', data: null });
});
