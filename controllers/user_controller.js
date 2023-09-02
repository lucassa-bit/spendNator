const ApiError = require('../utils/APIError');
const { filterObj } = require('../utils/utils');
const { catchAsync } = require('./error_controller');

// ------------------------------------- Initialization ------------------------------- //
const User = require(`${__dirname}/../models/user_model`);
const APIFeatures = require(`${__dirname}/../utils/APIFeature`);

// ----------------------------------- Controllers ---------------------------------- //
const getAllUsers = catchAsync(async (req, res, next) => {
  const query = new APIFeatures(User.find(), req.query)
    .filter()
    .pagination()
    .sort()
    .limitFields();

  const data = await query.request;
  
  res.status(200).json({
    status: 'Success',
    request_time: req.requestTime,
    results: data.length,
    data,
  });
});

const getUserById = catchAsync(async (req, res, next) => {
  const data = await User.findById(req.params.id);

  if (!data) {
    return next(new ApiError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'Success',
    request_time: req.requestTime,
    data,
  });
});

const patchUser = catchAsync(async (req, res, next) => {
  const data = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!data) {
    return next(new ApiError('No user found with that ID', 400));
  }

  res.status(202).json({
    status: 'Success',
    request_time: req.requestTime,
    message: 'successfully updated!',
  });
});

const patchMe = catchAsync(async (req, res, next) => {
  if(req.body.password)
    // || req.body.confirmPassword)
    return next(new ApiError("This route is not for password updates, please use another route"), 400);
  
  const body = filterObj(req.body, 'name', 'email');
  const user = await User.findByIdAndUpdate(req.user.id, body, {
    new: true,
    runValidators: true,
  });

  res.status(202).json({
    status: 'Success',
    request_time: req.requestTime,
    message: 'successfully updated!',
    user
  });
});

const deleteUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'Success',
    request_time: req.requestTime,
    message: 'Deleted successfully!',
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'Success',
    request_time: req.requestTime,
    message: 'Deleted successfully!',
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  patchUser,
  patchMe,
  deleteUser,
  deleteMe,
};
