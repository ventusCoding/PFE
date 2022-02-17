const express = require('express');
const objectController = require('../controllers/objectControllers');

const router = express.Router();

router.route('/').get(objectController.getAllObjects);

module.exports = router;
