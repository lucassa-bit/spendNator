// ------------------------------------- Initialization ------------------------------- //
const Express = require('express');
const controller = require('../controllers/user_controller');
const { protect, updateMyPassword, restrictTo } = require('../controllers/auth_controller');
const router = Express.Router();

// ------------------------------------- Routing ------------------------------- //
router.route('/').get(protect, restrictTo('Admin'), controller.getAllUsers);

router.route('/updateMyPassword').patch(protect, updateMyPassword);
router.route('/updateMe').patch(protect, controller.patchMe);
router.route('/deleteMe').delete(protect, controller.deleteMe);

router
  .route('/:id')
  .patch(protect, restrictTo('Admin'), controller.patchUser)
  .get(protect, restrictTo('Admin'), controller.getUserById)
  .delete(protect, restrictTo('Admin'), controller.deleteUser);

module.exports = router;
