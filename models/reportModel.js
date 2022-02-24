const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['comment', 'user'],
        required:[true,'report must have a type']
      },
      description: {
        type: String,
        required: [true, 'A report must have a description'],
        trim: true,
        maxlength: [
          255,
          'A report description must have less or equal than 255 characters',
        ],
        minlength: [
          10,
          'A report description must have more or equal than 10 characters',
        ],
      },
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
      comment: {
        type: mongoose.Schema.ObjectId,
        ref: 'Comment',
      },
      image : String,
      createdAt: {
        type: Date,
        default: Date.now(),
      },
    
})

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;