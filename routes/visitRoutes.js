const express = require('express');
const visitController = require('../controllers/visitController');
const authController = require('../controllers/authController');
const objectController = require('../controllers/objectControllers');

const router = express.Router();

router
  .route('/currentUserVisits')
  .get(
    authController.protect,
    authController.restrictTo('premium'),
    visitController.getCurrentUserVisits
  );

router
  .route('/belongVisits')
  .get(authController.protect, visitController.getBelongVisits);

router
  .route('/addUsersToVisit')
  .patch(
    authController.protect,
    authController.restrictTo('premium'),
    visitController.addUsersToVisit
  );

router
  .route('/deleteUsersToVisit')
  .patch(
    authController.protect,
    authController.restrictTo('premium', 'admin'),
    visitController.deleteUserFromVisit
  );

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    visitController.getAllVisits
  )
  .post(
    authController.protect,
    authController.restrictTo('premium'),
    visitController.createVisit
  );

router
  .route('/:id')
  .get(authController.protect, visitController.getVisitById)
  .patch(authController.protect, visitController.updateVisit)
  .delete(
    authController.protect,
    authController.restrictTo('premium', 'admin'),
    visitController.deleteVisit
  );

module.exports = router;
