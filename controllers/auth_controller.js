const jwt = require('jsonwebtoken');
const User = require('../models/user_model');
const ApiError = require('../utils/APIError');

const { catchAsync } = require('./error_controller');
const { promisify } = require('util');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  });

const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  const token = signToken(newUser.id);

  res.status(201).json({
    status: 'Success',
    token,
    data: {
      user: newUser,
    },
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new ApiError(
        'please provide ' + !email && password
          ? 'an email'
          : email
          ? 'a password'
          : 'an email and a password',
        400
      )
    );
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new ApiError('incorrect email or password', 401));
  }

  const token = signToken(user.id);

  res.status(201).json({
    status: 'Success',
    token,
  });
});

const protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token)
    return next(
      new ApiError('You are not logged in! Log in to get access', 401)
    );

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const freshUser = await User.findById(decoded.id);

  if (!freshUser)
    return next(
      new ApiError('The token belonging to this user no longer exist.', 401)
    );

  if (freshUser.changedPasswordAfter(decoded.iat))
    return next(
      new ApiError('User recently changed password! Please log in again.', 401)
    );

  req.user = freshUser;
  next();
});

const restrictTo = (...roles) =>
  catchAsync((req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You don't have permission to perform this action", 403)
      );
    }

    next();
  });

module.exports = {
  signup,
  login,
  protect,
  restrictTo,
};
