const ModelObject = require('../models/objectModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchasync = require('../utils/catchAsync');
const multer = require('multer');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `public/models`);
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.')[1];
    if (ext !== 'fbx') {
      return cb(new AppError('A model must have a model file .fbx', 400));
    }

    cb(null, `model-${req.user.name}-${Date.now()}.${ext}`);
  },
});

const upload = multer({
  storage: multerStorage,
});

exports.uploadModel = upload.single('modelfbx');

exports.createObject = catchasync(async (req, res, next) => {
  const newObj = await ModelObject.create({
    name: req.body.name,
    modelfbx: req.file.filename,
    user: req.user._id,
  });

  res.status(201).json({ status: 'success', data: { object: newObj } });
});

exports.getObjectById = catchasync(async (req, res, next) => {
  const object = await ModelObject.findById(req.params.id);

  if (!object) {
    return next(new AppError('No object found with that ID', 404));
  }

  if (object.user.toString() !== req.user._id.toString()) {
    return next(
      new AppError('You are not authorized to access this object', 401)
    );
  }

  res.status(200).json({ status: 'success', data: { object } });
});

exports.updateObject = catchasync(async (req, res, next) => {
  let obj = {};

  if (req.body.name) {
    obj.name =req.body.name ;
  }

  if (req.file) {
    obj.modelfbx = req.file.filename;
  }

  if (Object.keys(obj).length === 0) {
    return next(new AppError('Nothing to update', 404));
  }

  const updatedObj = await ModelObject.findByIdAndUpdate(req.params.id, obj, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedObj,
    },
  });
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

exports.getCurrentUserObjects = catchasync(async (req, res, next) => {
  const features = new APIFeatures(
    ModelObject.find({ user: req.user._id }),
    req.query
  )
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
