const ApiError = require('../utils/APIError');
const { catchAsync } = require('./error_controller');

// ------------------------------------- Initialization ------------------------------- //
const Gain = require(`${__dirname}/../models/gain_model`);
const APIFeatures = require(`${__dirname}/../utils/APIFeature`);

// ------------------------------------- Controllers ------------------------------- //
const getAllGains = catchAsync(async (req, res, next) => {
  const query = new APIFeatures(Gain.find(), req.query)
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

const getGainById = catchAsync(async (req, res, next) => {
  const data = await Gain.findById(req.params.id);

  if (!data) {
    return next(new ApiError('No gain found with that ID', 404));
  }

  res.status(200).json({
    status: 'Success',
    request_time: req.requestTime,
    data,
  });
});

const postNewGain = catchAsync(async (req, res, next) => {
  const entity = await Gain.create({ ...req.body, user_id: req.user._id });
  entity.save();

  res.status(201).json({
    status: 'Created',
    request_time: req.requestTime,
    message: 'Tour created sucessfully!!',
  });
});

const patchGain = catchAsync(async (req, res, next) => {
  const data = await Gain.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!data) {
    return next(new ApiError('No gain found with that ID', 404));
  }

  res.status(202).json({
    status: 'Success',
    request_time: req.requestTime,
    message: 'successfully updated!',
  });
});

const deleteGain = catchAsync(async (req, res, next) => {
  await Gain.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'Success',
    request_time: req.requestTime,
    message: 'Deleted successfully!',
  });
});

const getMyGains = catchAsync(async (req, res, next) => {
  const myGains = Gain.findBy({ user_id: req.user.id });

  res.status(200).json({
    status: 'Success',
    request_time: req.requestTime,
    data: myGains,
  });
});

module.exports = {
  getAllGains,
  getGainById,
  postNewGain,
  patchGain,
  deleteGain,
  getMyGains,
};
