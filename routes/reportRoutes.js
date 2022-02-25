const express = require('express');
const reportController = require('../controllers/reportController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    reportController.getAllreports
  )
  .post(
    authController.protect,
    reportController.uploadReportImage,
    reportController.resizeReportImage,
    reportController.createreport
  );

router
  .route('/:id')
  .get(authController.protect, reportController.getreportById);

module.exports = router;
