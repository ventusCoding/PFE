const express = require('express');
const visitController = require('../controllers/visitController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/currentUserVisits')
  .get(
    authController.protect,
    authController.restrictTo('premium'),
    visitController.getCurrentUserVisits
  );

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('premium'),
    visitController.getAllVisits
  )
  .post(
    authController.protect,
    authController.restrictTo('premium'),
    visitController.createVisit
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('premium'),
    visitController.getVisitById
  )
  .patch(
    authController.protect,
    authController.restrictTo('premium'),
    visitController.addUserToVisit
  )
  .delete(
    authController.protect,
    authController.restrictTo('premium'),
    visitController.deleteUserFromVisit
  );

module.exports = router;
