// ------------------------------------- Initialization ------------------------------- //
const Express = require('express');
const controller = require('../controllers/auth_controller');
const { catchAsync } = require('../controllers/error_controller');

const router = Express.Router();

// ------------------------------------- Routing ------------------------------- //
router.route('/signup').post(catchAsync(controller.signup));
router.route('/login').post(catchAsync(controller.login));

module.exports = router;
