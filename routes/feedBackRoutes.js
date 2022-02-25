const express = require('express');
const feedBackController = require('../controllers/feedBackController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    feedBackController.getAllFeedBacks
  )
  .post(
    authController.protect,
    feedBackController.createFeedBack
  );

  router
  .route('/:id')
  .get(
    authController.protect,
    feedBackController.getFeedBackById
  )

module.exports = router;