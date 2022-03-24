const ModelObject = require('../models/objectModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchasync = require('../utils/catchAsync');
const multer = require('multer');
const { uuid } = require('uuidv4');
const sharp = require('sharp');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, `public/img/models`);
    } else {
      cb(null, `protected_files/models`);
    }
  },
  filename: catchasync(async (req, file, cb) => {
    const fileArray = file.originalname.split('.')
    if (file.mimetype.startsWith('image')) {
      const ext = fileArray[fileArray.length - 1];
      modelName = fileArray[0];
      cb(null, `model-${modelName}-${uuid()}-${Date.now()}.${ext}`);
    } else {
      const ext = fileArray[fileArray.length - 1];
      modelName = fileArray[0];
      if (ext !== 'fbx') {
        return cb(new AppError('A model must have a model file .fbx', 400));
      }

      cb(null, `model-${modelName}-${uuid()}-${Date.now()}.${ext}`);
    }
  }),
});

const upload = multer({
  storage: multerStorage,
});

exports.uploadModel = upload.fields([
  { name: 'modelfbx' },
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 10 },
]);

exports.createObject = catchasync(async (req, res, next) => {
  let modelsNames, images, imageCover;

  if (req.files.modelfbx) {
    modelsNames = req.files.modelfbx.map((file) => file.filename);
  }

  if (req.files.images) {
    images = req.files.images.map((file) => file.filename);
  }

  if (req.files.imageCover) {
    imageCover = req.files.imageCover[0].filename;
  }

  if (!modelsNames) {
    return next(new AppError('A model must have a 3D model(s) file .fbx', 400));
  }

  const newObj = await ModelObject.create({
    name: req.body.name,
    description: req.body.description,
    modelfbx: modelsNames,
    user: req.user._id,
    images,
    imageCover,
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
    obj.name = req.body.name;
  }

  if (req.body.description) {
    obj.description = req.body.description;
  }

  if (req.files.modelfbx) {
    const oldModel = await ModelObject.findById(req.params.id);
    const modelsNames = req.files.modelfbx.map((file) => file.filename);
    obj.modelfbx = oldModel.modelfbx.concat(modelsNames);
  }

  if (req.files.images) {
    const oldModel = await ModelObject.findById(req.params.id);
    const images = req.files.images.map((file) => file.filename);
    obj.images = oldModel.images.concat(images);
  }

  if (req.files.imageCover) {
    obj.imageCover = req.files.imageCover[0].filename;
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


exports.deleteImagesFromList = catchasync(async (req, res, next) => {
  const oldModel = await ModelObject.findById(req.body.id);

  const imagesToDelete = req.body.images;

  const images = oldModel.images.filter((img) => {
    return !imagesToDelete.includes(img);
  });

  const updatedObj = await ModelObject.findByIdAndUpdate(
    req.body.id,
    {
      images
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      updatedObj,
    },
  });
});


exports.deleteObjectsFromList = catchasync(async (req, res, next) => {
  const oldModel = await ModelObject.findById(req.body.id);

  const modelsNamesToDelete = req.body.modelsfbx;

  const modelsNames = oldModel.modelfbx.filter((model) => {
    return !modelsNamesToDelete.includes(model);
  });

  const updatedObj = await ModelObject.findByIdAndUpdate(
    req.body.id,
    {
      modelfbx: modelsNames,
    },
    {
      new: true,
      runValidators: true,
    }
  );

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
