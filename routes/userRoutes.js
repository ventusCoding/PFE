const express = require('express');
const userController = require('../controllers/userControllers');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/signup',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  authController.signup
);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

router.patch(
  '/updateMe',
  authController.protect,
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router
  .route('/:id')
  .get(authController.protect, userController.getUserById)
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    userController.deleteUserByAdmin
  );

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    userController.getAllUsers
  );

module.exports = router;
