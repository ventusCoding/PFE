const express = require('express');
const objectController = require('../controllers/objectControllers');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('premium'),
    objectController.getAllObjects
  )
  .post(
    authController.protect,
    authController.restrictTo('premium'),
    objectController.createObject
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('premium'),
    objectController.getObjectById
  )
  .patch(
    authController.protect,
    authController.restrictTo('premium'),
    objectController.updateObject
  )
  .delete(
    authController.protect,
    authController.restrictTo('premium'),
    objectController.deleteObject
  );

module.exports = router;
