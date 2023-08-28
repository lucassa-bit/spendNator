const ApiError = require('../utils/APIError');
const { catchAsync } = require('./error_controller');

// ------------------------------------- Initialization ------------------------------- //
const User = require(`${__dirname}/../models/user_model`);
const APIFeatures = require(`${__dirname}/../utils/APIFeature`);

// ------------------------------------- Controllers ------------------------------- //
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
    return next(new ApiError('No user found with that ID', 404));
  }

  res.status(202).json({
    status: 'Success',
    request_time: req.requestTime,
    message: 'successfully updated!',
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

module.exports = {
  getAllUsers,
  getUserById,
  patchUser,
  deleteUser,
};
