const express = require('express');
const morgan = require('morgan');

const objectRoutes = require('./routes/objectRoutes');
const userRoutes = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const cors = require('cors');

const app = express();

app.use(cors());

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/objects', objectRoutes);
app.use('/api/v1/users', userRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
