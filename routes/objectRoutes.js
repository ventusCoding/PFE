const express = require('express');
const objectController = require('../controllers/objectControllers');

const router = express.Router();

router
  .route('/')
  .get(objectController.getAllObjects)
  .post(objectController.createObject);

router
  .route('/:id')
  .get(objectController.getObjectById)
  .patch(objectController.updateObject)
  .delete(objectController.deleteObject);

module.exports = router;
