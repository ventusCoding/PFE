const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../Models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const ObjectModel = require('../models/objectModel');
const mongoose = require('mongoose');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.resendVerificationEmail = catchAsync(async (req, res, next) => {
  if (!req.body.email) {
    return next(
      new AppError('Tell us your email to send the verification email', 404)
    );
  }

  const user = await User.find({ email: req.body.email });

  const newUser = user[0];

 

  const resetToken = newUser.createVerificationToken();
  await newUser.save({ validateBeforeSave: false });

  //TODO: change the verifUrl (reset url is the endpoint you need to create the link for react and pass this endpoint to react)
  const verifUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/emailVerification/${resetToken}`;

  await new Email(newUser, verifUrl).sendWelcome();

  res.status(201).json({
    status: 'success',
    message: 'Verify your email to complete registration',
    url: verifUrl,
  });

  // createSendToken(newUser, 201, res);
});

exports.signup = catchAsync(async (req, res, next) => {
  let userData = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  };

  if (req.file) {
    userData.photo = req.file.filename;
  }

  const newUser = await User.create(userData);

  const resetToken = newUser.createVerificationToken();
  await newUser.save({ validateBeforeSave: false });

  //TODO: change the verifUrl (reset url is the endpoint you need to create the link for react and pass this endpoint to react)
  const verifUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/emailVerification/${resetToken}`;

  await new Email(newUser, verifUrl).sendWelcome();

  res.status(201).json({
    status: 'success',
    message: 'Verify your email to complete registration',
    url: verifUrl,
  });

  // createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (!user.verified) {
    return next(
      new AppError('Account not verified! verify you account to login', 401)
    );
  }



  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in ! Please login to get access.', 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does no longer exist.')
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address', 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    // await Email({
    //   email: user.email,
    //   subject: 'Your password reset token (valid for 10 minutes)',
    //   message,
    // });
    //TODO: change the resetURL (reset url is the endpoint you need to create the link for react and pass this endpoint to react)
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    // const message = `Forgot your password ? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
      url: resetURL,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError(err, 500));
  }
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  await User.findByIdAndUpdate(user._id, { verified: true });

  const verifiedUser = await User.findById(user._id);



  // createSendToken(verifiedUser, 200, res);

  res.status(201).json({
    status: 'success',
    message: 'Congratulation you complete your registration. try to login now.',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, 200, res);
});

exports.protectModels = catchAsync(async (req, res, next) => {
  const model = await ObjectModel.find({ modelfbx: req.params.path });

  if (!model[0].user.equals(mongoose.Types.ObjectId(req.user.id))) {
    return next(new AppError('You cannot access to this model.', 401));
  }

  next();
});
