// ------------------------------------- Initialization ------------------------------- //
const Express = require('express');
const controller = require('../controllers/user_controller');
const { protect } = require('../controllers/auth_controller');

const router = Express.Router();

// ------------------------------------- Routing ------------------------------- //
router.route('/').get(protect, controller.getAllUsers);

router
  .route('/:id')
  .patch(protect, controller.patchUser)
  .get(protect, controller.getUserById)
  .delete(protect, controller.deleteUser);

module.exports = router;
