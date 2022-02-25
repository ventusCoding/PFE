const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const UserModel = require('../models/userModel');
const CommentModel = require('../models/commentModel');
const ObjectModel = require('../models/objectModel');
const FeedbackModel = require('../models/feedBackModel');
const ReportModel = require('../models/reportModel');
const VisitModel = require('../models/VisitModel');

dotenv.config({ path: './config.env' });

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful'));

// Read Json File
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/data/users-dummy-data.json`, 'utf-8')
);
const visits = JSON.parse(
  fs.readFileSync(`${__dirname}/data/visits-dummy-data.json`, 'utf-8')
);
const comments = JSON.parse(
  fs.readFileSync(`${__dirname}/data/comments-dummy-data.json`, 'utf-8')
);
const objects = JSON.parse(
  fs.readFileSync(`${__dirname}/data/objects-dummy-data.json`, 'utf-8')
);
const feedbacks = JSON.parse(
  fs.readFileSync(`${__dirname}/data/feedbacks-dummy-data.json`, 'utf-8')
);
const reports = JSON.parse(
  fs.readFileSync(`${__dirname}/data/reports-dummy-data.json`, 'utf-8')
);

// Import Data Into DB

const importUserData = async () => {
  try {
    await UserModel.create(users);
    console.log('Data successfully loaded!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
const importCommentData = async () => {
  try {
    await CommentModel.create(comments);
    console.log('Data successfully loaded!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
const importVisitData = async () => {
  try {
    await VisitModel.create(visits);
    console.log('Data successfully loaded!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
const importObjectData = async () => {
  try {
    await ObjectModel.create(objects);
    console.log('Data successfully loaded!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
const importReportData = async () => {
  try {
    await ReportModel.create(reports);
    console.log('Data successfully loaded!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const importFeedbackData = async () => {
  try {
    await FeedbackModel.create(feedbacks);
    console.log('Data successfully loaded!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// Delete All Data From Collection

const deleteUserData = async () => {
  try {
    await UserModel.deleteMany();
    console.log('Data successfully deleted!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
const deleteObjectData = async () => {
  try {
    await ObjectModel.deleteMany();
    console.log('Data successfully deleted!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
const deleteVisitData = async () => {
  try {
    await VisitModel.deleteMany();
    console.log('Data successfully deleted!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
const deleteCommentData = async () => {
  try {
    await CommentModel.deleteMany();
    console.log('Data successfully deleted!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
const deleteFeedbackData = async () => {
  try {
    await FeedbackModel.deleteMany();
    console.log('Data successfully deleted!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
const deleteReportData = async () => {
  try {
    await ReportModel.deleteMany();
    console.log('Data successfully deleted!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] == '--import') {
  importUserData();
  importVisitData();
  importCommentData();
  importReportData();
  importObjectData();
  importFeedbackData();
} else if (process.argv[2] === '--delete') {
  deleteUserData();
  deleteVisitData();
  deleteCommentData();
  deleteReportData();
  deleteObjectData();
  deleteFeedbackData();
}

console.log(process.argv);
