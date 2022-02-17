const express = require('express');
const morgan = require('morgan');

const objectRoutes = require('./routes/objectRoutes');

const app = express();

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/objects', objectRoutes);

module.exports = app;