// ------------------------------------- Initialization ------------------------------- //
const Express = require('express');
const controller = require('../controllers/auth_controller');
const { getUserById } = require('../controllers/user_controller');
const router = Express.Router();

// ------------------------------------- Routing ------------------------------- //
router.route('/signup').post(controller.signup);
router.route('/login').post(controller.login);
router.route('/me').get(controller.protect, controller.getMe, getUserById);
router.route('/forgotPassword').post(controller.forgotPassword);
router.route('/resetPassword/:token').patch(controller.resetPassword);

module.exports = router;
 