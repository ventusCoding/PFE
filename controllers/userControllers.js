const User = require('../Models/userModel');
const multer = require('multer');
const sharp = require('sharp');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchasync = require('../utils/catchAsync');
const { uuid } = require('uuidv4');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

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

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchasync(async (req, res, next) => {
  if (!req.file) return next();

  if (req.user) {
    req.file.filename = `user-${req.user.name}-${
      req.user.id
    }-${Date.now()}.jpeg`;
  } else {
    req.file.filename = `user-${uuid()}-${Date.now()}.jpeg`;
  }

  console.log(req.file);

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchasync(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;

  if (users.length > 0) {
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: users.length,
      data: {
        users,
      },
    });
  } else {
    res.status(404).json({
      status: 'fail',
      results: 0,
      data: {
        users,
      },
      message: 'No Data Found!',
    });
  }
});

exports.getUserById = catchasync(async (req, res, next) => {

  const user = await User.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: user,
  });
});

exports.deleteMe = catchasync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.deleteUserByAdmin = catchasync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.params.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.updateMe = catchasync(async (req, res, next) => {
  // console.log(req.file);
  // console.log(req.body);

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }

  const filteredBody = filterObj(req.body, 'name', 'email');

  if (req.file) {
    filteredBody.photo = req.file.filename;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
