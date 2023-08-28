// ------------------------------------- Initialization ------------------------------- //
const Express = require('express');

const userRouter = require(`./routes/user_route`);
const authRouter = require(`./routes/authentication_route`);
const gainRouter = require(`./routes/gain_route`);
const expenseRouter = require(`./routes/expense_route`);
const APIError = require(`./utils/APIError`);
const { error_handler } = require('./controllers/Error_controller');

const server = new Express();
// ------------------------------------- Middleware ------------------------------- //

if (process.env.NODE_ENV === 'development') {
  server.use(require('morgan')('dev'));
}

server.use(Express.json());

server.use((req, res, next) => {
  const date = new Date();
  // Putting in the local time zone
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
