const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../Models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
// const sendEmail = require('../utils/email');

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    photo: req.body.photo,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});
