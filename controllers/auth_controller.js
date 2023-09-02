const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user_model');
const ApiError = require('../utils/APIError');

const { catchAsync } = require('./error_controller');
const { promisify } = require('util');
const { sendEmail } = require('../utils/Emails');

// ------------------------------------- Autenticação ------------------------------- //
const getMe = (req, res, next) => {
  req.params.id = req.user.id;

  next();
};

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
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
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You don't have permission to perform this action", 403)
      );
    }

    next();
  };

const sendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRATION_TIME * 24 * 60 * 60 * 1000),
    httpOnly: true
  }

  if (process.env.NODE_ENV === 'production')
    cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'Success',
    token,
    data: {
      user,
    },
  });
};

// ------------------------------------- Acesso ------------------------------- //

const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  sendToken(newUser, 201, res);
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
  sendToken(user, 200, res);
});

const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new ApiError('There is no user with that email address', 404));

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.get('host')}/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit your patch request
  with your new password to: ${resetURL}.\nif your didn't forget ignore this email`

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (10 minutes to reset)',
      message
    });

    res.status(200).json({
      status: 'Success',
      request_time: req.requestTime,
      message: 'Email successfuly sended',
    });
  }
  catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ApiError("There was an error sending the email. Try again later", 500));
  }
})

const resetPassword = catchAsync(async (req, res, next) => {
  if (!req.body.password
    // || !req.body.passwordConfirm )
  ) {
    return next(ApiError('New password is needed for the update', 400));
  }

  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

  if (!user)
    return next(new ApiError('Token is invalid or has expired', 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;

  await user.save();

  sendToken(user, 200, res);
});

const updateMyPassword = catchAsync(async (req, res, next) => {
  if (!req.body.password || !req.body.newPassword
    // || !req.body.NewPasswordConfirm )
  ) {
    return next(new ApiError('Resources are not enough to change the password', 400));
  }

  const user = await User.findById(req.user.id).select('+password');

  if (!user || !(await user.correctPassword(req.body.password, user.password)))
    return next(new ApiError('The resources needed are invalid', 403));

  user.password = req.body.newPassword;
  await user.save();

  sendToken(user, 200, res);
});

module.exports = {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updateMyPassword,
  getMe
};
