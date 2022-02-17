const mongoose = require('mongoose');

const objectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A model must have a name'],
    unique: true,
  },
  modelfbx: {
    type: String,
    required: [true, 'A model must have a model file .fbx'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
});

const Object = mongoose.model('Object', objectSchema);

module.exports = Object;
