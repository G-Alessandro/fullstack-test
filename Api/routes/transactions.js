const express = require('express');
const controller = require('../controllers/transactions');
const { isAuth } = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');

const router = express.Router();

router.route('/').get(isAuth, rbac('transactions', 'read'), controller.get);

module.exports = router;
