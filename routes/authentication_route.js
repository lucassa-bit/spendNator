// ------------------------------------- Initialization ------------------------------- //
const Express = require('express');
const controller = require('../controllers/auth_controller');
const router = Express.Router();

// ------------------------------------- Routing ------------------------------- //
router.route('/signup').post(controller.signup);
router.route('/login').post(controller.login);
router.route('/forgotPassword').post(controller.forgotPassword);
router.route('/resetPassword/:token').patch(controller.resetPassword);

module.exports = router;
 