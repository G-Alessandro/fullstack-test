const express = require('express');
const controller = require('../controllers/transactions');
const { isAuth } = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');
const { validator } = require('../middlewares/validator');

const router = express.Router();

router
  .route('/')
  .get(isAuth, rbac('transactions', 'read'), controller.get)
  .post(validator('createTransaction'), isAuth, rbac('transactions', 'create'), controller.create);
module.exports = router;
