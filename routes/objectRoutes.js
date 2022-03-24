const express = require('express');
const objectController = require('../controllers/objectControllers');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/currentUserObjects')
  .get(
    authController.protect,
    authController.restrictTo('premium'),
    objectController.getCurrentUserObjects
  );

router
  .route('/deleteObjectsFromModelList')
  .delete(
    authController.protect,
    authController.restrictTo('premium'),
    objectController.deleteObjectsFromList
  );

  router
  .route('/deleteImagesFromImagesList')
  .delete(
    authController.protect,
    authController.restrictTo('premium'),
    objectController.deleteImagesFromList
  );


router
  .route('/')
  .get(
    authController.protect,
    // authController.restrictTo('admin'),
    objectController.getAllObjects
  )
  .post(
    authController.protect,
    authController.restrictTo('premium'),
    objectController.uploadModel,

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
    objectController.uploadModel,
    objectController.updateObject
  )
  .delete(
    authController.protect,
    authController.restrictTo('premium'),
    objectController.deleteObject
  );

module.exports = router;
