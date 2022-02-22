const express = require('express');
const commentController = require('../controllers/commentController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .post(authController.protect, commentController.createComment);

router
  .route('/:id')
  .get(authController.protect, commentController.getCommentById);

module.exports = router;
