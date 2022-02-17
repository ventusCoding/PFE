const { query } = require('express');
const ModelObject = require('../models/objectModel');
const APIFeatures = require('../utils/apiFeatures');

exports.createObject = async (req, res) => {
  try {
    const newObj = await ModelObject.create(req.body);

    res.status(201).json({ status: 'success', data: { object: newObj } });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent!',
      error: err,
    });
  }
};

exports.getObjectById = async (req, res) => {
  try {
    const object = await ModelObject.findById(req.params.id);

    res.status(200).json({ status: 'success', data: { object } });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateObject = async (req, res) => {
  try {
    const object = await ModelObject.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    res.status(200).json({ status: 'success', data: { object } });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent!',
      error: err,
    });
  }
};

exports.deleteObject = async (req, res) => {
  try {
    const object = await ModelObject.findByIdAndDelete(req.params.id);

    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      error: err,
    });
  }
};

exports.getAllObjects = async (req, res) => {
  try {
    const features = new APIFeatures(ModelObject.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const objects = await features.query;

    if (objects.length > 0) {
      res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: objects.length,
        data: {
          objects,
        },
      });
    } else {
      res.status(404).json({
        status: 'fail',
        results: 0,
        data: {
          objects,
        },
        message: 'No Data Found!',
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.filterObjectByName = async (req, res) => {
  try {
    const objects = await ModelObject.find(
      { name: /Lac2/ }
    );

    res.status(200).json({
      status: 'success',
      data: {
        objects,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
