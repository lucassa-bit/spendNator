const ApiError = require("../utils/APIError");
const { catchAsync } = require("./error_controller");

// ------------------------------------- Initialization ------------------------------- //
const Expense = require(`${__dirname}/../models/expense_model`);
const APIFeatures = require(`${__dirname}/../utils/APIFeature`);

// ------------------------------------- Controllers ------------------------------- //
const aliasDayExpenses = catchAsync((req, res, next) => {
  req.query.createdAt = {};

  const date = new Date(req.requestTime);
  req.query.createdAt.gte = date.toISOString();

  // day * hour * seconds * milliseconds;
  const oneDaySum = 24 * 60 * 60 * 1000;
  date.setTime(date.getTime() + oneDaySum);
  req.query.createdAt.lte = date.toISOString();

  next();
});

const dateMatch = catchAsync((req, res, next) => {
  const createdAt = {};
  if (req.query.date) {
    Object.keys(req.query.date).forEach((key) => {
      createdAt['$' + key] = new Date(req.query.date[key]);
    });

    req.query.match = [
      {
        $match: {
          createdAt,
        },
      },
    ];
  }

  next();
});

const getExpensesSum = catchAsync(async (req, res, next) => {
  const format = req.query.dateFormat || '%Y-%m';
  const match = req.query.match || [];
  const stats = await Expense.aggregate([
    ...match,
    {
      $group: {
        _id: {
          category: '$category',
          date: { $dateToString: { format, date: '$createdAt' } },
        },
        expenses: {
          $accumulator: {
            // initial state
            init: function () {
              return { count: 0, sum: 0 };
            },
            // how will accumulate the values
            accumulate: function (state, expense) {
              return {
                count: state.count + 1,
                sum: state.sum + expense,
              };
            },
            // which attribute it will focus on
            accumulateArgs: ['$value'],
            // if a merge happens, between groups
            merge: function (state1, state2) {
              return {
                count: state1.count + state2.count,
                sum: state1.sum + state2.sum,
              };
            },
            // return
            finalize: function (state) {
              return {
                sum: state.sum,
                count: state.count,
              };
            },
            lang: 'js',
          },
        },

        minExpense: { $min: '$value' },
        maxExpense: { $max: '$value' },
      },
    },
    {
      $group: {
        _id: '$_id.date',
        expenses: {
          $push: {
            _id: '$_id.category',
            statistics: '$expenses',
          },
        },
      },
    },
    {
      $sort: {
        category: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'Success',
    request_time: req.requestTime,
    data: {
      stats,
    },
  });
});

// CRUD
const getAllExpenses = catchAsync(async (req, res, next) => {
  const query = new APIFeatures(Expense.find(), req.query)
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

const getExpenseById = catchAsync(async (req, res, next) => {
  const data = await Expense.findById(req.params.id);

  if (!data) {
    return next(new ApiError('No expense found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'Success',
    request_time: req.requestTime,
    data,
  });
});

const postNewExpense = catchAsync(async (req, res, next) => {
  const entity = await Expense.create({ ...req.body, user_id: req.user.id });
  entity.save();

  res.status(201).json({
    status: 'Created',
    request_time: req.requestTime,
    message: 'Tour created sucessfully!!',
  });
});

const patchExpense = catchAsync(async (req, res, next) => {
  const data = await Expense.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!data) {
    return next(new ApiError('No expense found with that ID', 404));
  }
  res.status(202).json({
    status: 'Success',
    request_time: req.requestTime,
    message: 'successfully updated!'
  });
});

const deleteExpense = catchAsync(async (req, res, next) => {
  await Expense.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'Success',
    request_time: req.requestTime,
    message: 'Deleted successfully!',
  });
});

module.exports = {
  getAllExpenses,
  getExpenseById,
  postNewExpense,
  patchExpense,
  deleteExpense,
  aliasDayExpenses,
  getExpensesSum,
  dateMatch,
};
