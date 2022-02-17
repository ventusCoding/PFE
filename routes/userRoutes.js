const express = require('express');
const userController = require('../controllers/userControllers');

const router = express.Router();

router.route('/').get(userController.getAllUsers);

module.exports = router;
