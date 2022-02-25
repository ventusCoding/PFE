const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const objectRoutes = require('./routes/objectRoutes');
const userRoutes = require('./routes/userRoutes');
const authController = require('./controllers/authController');
const feedBackRoutes = require('./routes/feedBackRoutes');
const reportRoutes = require('./routes/reportRoutes');
const visitRoutes = require('./routes/visitRoutes');
const commentRoutes = require('./routes/commentRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');

const app = express();

app.use(cors());

app.use(helmet());

if (process.env.USER === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 300,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: ['name'],
  })
);

app.use(express.static(`${__dirname}/public`));

app.get(
  '/file/:path',
  authController.protect,
  authController.restrictTo('premium'),
  authController.protectModels,
  function (req, res) {
    const path = 'protected_files/models/' + req.params.path;
    const stream = fs.createReadStream(path);
    const stats = fs.statSync(path);
    stream.on('open', () => res.setHeader('Content-Length', stats.size));
    stream.pipe(res);
  }
);

app.use('/api/v1/objects', objectRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/visits', visitRoutes);
app.use('/api/v1/feedbacks', feedBackRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/reports', reportRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
