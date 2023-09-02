// ------------------------------------- Initialization ------------------------------- //
const Express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const sanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const userRouter = require(`./routes/user_route`);
const authRouter = require(`./routes/authentication_route`);
const gainRouter = require(`./routes/gain_route`);
const expenseRouter = require(`./routes/expense_route`);

const { error_handler } = require('./controllers/error_controller');

const APIError = require(`./utils/APIError`);

const server = new Express();

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: {
    status: 'Fail',
    message: 'Too many request from this IP, please try again later!'
  }
});
// ------------------------------------- Middleware ------------------------------- //
// Security http headers
server.use(helmet());

// Develop logging
if (process.env.NODE_ENV === 'development') {
  server.use(require('morgan')('dev'));
}

// Security http request limiter
server.use("/", limiter)

// Body parser, reading data from the body into req.body
server.use(Express.json( { limit: '10kb' } ));

// Data sanitazation against NoSQL query injection
server.use(sanitize());

// Data sanitazation against XSS
server.use(xss());

// Prevent parameter pollution
server.use(hpp({
  whitelist: [
    'name',
    'category',
    'user_id'
  ]
}));

// Putting in the local time zone
server.use((req, res, next) => {
  const date = new Date();
  date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000);

  req.requestTime = date.toISOString();

  next();
});

// Authentication route
server.use('/', authRouter);
// Expense route
server.use('/api/v1/expense', expenseRouter);
// Gain route
server.use('/api/v1/gain', gainRouter);
// User route
server.use('/api/v1/users', userRouter);

// 404 route
server.all('*', (req, res, next) => {
  next(new APIError(`Can't find the ${req.originalUrl} on this server`, 404));
});

server.use(error_handler);

module.exports = server;
