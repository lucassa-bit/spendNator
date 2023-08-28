// ------------------------------------- Initialization ------------------------------- //
const Express = require('express');
const controller = require('../controllers/gain_controller');
const { protect, restrictTo } = require('../controllers/auth_controller');

const router = Express.Router();

// ------------------------------------- Routing ------------------------------- //

router
  .route('/')
  .get(protect, restrictTo('Admin'), controller.getAllGains)
  .post(protect, restrictTo('Admin', 'User'), controller.postNewGain);

router
  .route('/:id')
  .get(protect, restrictTo('Admin', 'User'), controller.getGainById)
  .patch(protect, restrictTo('Admin', 'User'), controller.patchGain)
  .delete(protect, restrictTo('Admin', 'User'), controller.deleteGain);

router
  .route('/me')
  .get(protect, restrictTo('Admin', 'User'), controller.getMyGains);

module.exports = router;
