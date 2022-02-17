const mongoose = require('mongoose');

const objectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A model must have a name'],
    unique: true,
    trim: true,
    maxlength: [20, 'A model name must have less or equal than 20 characters'],
    minlength: [3, 'A model name must have more or equal than 3 characters'],
  },
  modelfbx: {
    type: String,
    required: [true, 'A model must have a model file .fbx'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
});

const Object = mongoose.model('Object', objectSchema);

module.exports = Object;
