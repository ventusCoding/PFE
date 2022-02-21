const express = require('express');
const morgan = require('morgan');
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const objectRoutes = require('./routes/objectRoutes');
const userRoutes = require('./routes/userRoutes');
const feedBackRoutes = require('./routes/feedBackRoutes');
const visitRoutes = require('./routes/visitRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const cors = require('cors');

const app = express();

app.use(cors());

app.use(helmet());

if (process.env.USER === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 300,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));

app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: [
      "name",
    ],
  })
);

app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/objects', objectRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/visits', visitRoutes);
app.use('/api/v1/feedbacks', feedBackRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
