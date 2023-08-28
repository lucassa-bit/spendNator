const ApiError = require('../utils/APIError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;

  return new ApiError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value: ${
    Object.keys(err.keyValue)[0]
  }, please use another value!`;

  return new ApiError(message, 400);
};

const handleValidateFieldsDB = (err) => {
  const errors = Object.values(err.errors).map((val) => {
    console.log(val);
    return val.message;
  });
  const message = `Invalid input data: ${errors.join('. ')}`;

  return new ApiError(message, 400);
};

const handleJWTError = () => {
  const message = `Invalid token. Please log in again!`;

  return new ApiError(message, 401);
};

const handleExpiredError = () => {
  const message = `Your token has expired! Please log in again!`;

  return new ApiError(message, 401);
};

const error_handle_dev = (err, res) => {
  res.status(err.statusCode).json({
    ...err,
    message: err.message,
    stack: err.stack,
  });
};

const error_handle_prod = (err, res) => {
  // Operational, trusted error: send message to the client
  if (err.isOperational)
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  // Programming or other unknown error: don't leak the details
  else {
    // log Error
    console.error('ERROR !!!!!!', err);
    // send a message
    res.status(500).json({
      status: 500,
      message: 'Something went very wrong!',
    });
  }
};

const errorFinder = (error) => {
  let return_error;

  if (error.name === 'CastError') {
    return_error = handleCastErrorDB(error);
  } else if (error.code === 11000) {
    return_error = handleDuplicateFieldsDB(error);
  } else if (error.name === 'ValidationError') {
    return_error = handleValidateFieldsDB(error);
  } else if (error.name === 'JsonWebTokenError') {
    return_error = handleJWTError();
  } else if (error.name === 'JsonExpiredError') {
    return_error = handleExpiredError();
  }

  console.log(error);
  return return_error || new ApiError(error.message, error.statusCode);
};

const catchAsync = function (fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
};

const error_handler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'production') {
    const error = errorFinder({
      ...err,
      name: err.stack.split(':')[0],
      message: err.message,
    });

    error_handle_prod(error, res);
  } else if (process.env.NODE_ENV === 'development') {
    error_handle_dev(err, res);
  }
};

module.exports = { error_handler, catchAsync };
