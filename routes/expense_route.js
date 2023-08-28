// ------------------------------------- Initialization ------------------------------- //
const Express = require('express');
const controller = require('../controllers/expense_controller');
const { protect, restrictTo } = require('../controllers/auth_controller');

const router = Express.Router();

// ------------------------------------- Routing ------------------------------- //
router
  .route('/day')
  .get(
    protect,
    restrictTo('Admin'),
    controller.aliasDayExpenses,
    controller.getAllExpenses
  );

router
  .route('/sum')
  .get(
    protect,
    restrictTo('Admin'),
    controller.dateMatch,
    controller.getExpensesSum
  );

router
  .route('/')
  .get(protect, restrictTo('Admin'), controller.getAllExpenses)
  .post(protect, restrictTo('Admin'), controller.postNewExpense);
router
  .route('/:id')
  .get(protect, restrictTo('Admin'), controller.getExpenseById)
  .patch(protect, restrictTo('Admin'), controller.patchExpense)
  .delete(protect, restrictTo('Admin'), controller.deleteExpense);

module.exports = router;
