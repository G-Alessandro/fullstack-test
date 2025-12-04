const mongoose = require('mongoose');
const Transaction = require('../models/transaction');
const getter = require('../helpers/getter');
const { SendData, ServerError } = require('../helpers/response');

module.exports.get = async (req, res, next) => {
  try {
    const { filter, isExpense } = req.query;
    const { user } = res.locals;
    const query = {};

    if (user.company.roles.includes('admin') || user.roles.includes('admin')) {
      query.userId = new mongoose.Types.ObjectId(user.id);
    }

    if (isExpense) {
      query.isExpense = isExpense;
    }

    if (filter) {
      query.description = new RegExp(filter, 'i');
    }

    // Pipeline to find and return the total expenses, revenues, and balance
    const pipeline = [
      { $match: query.userId ? { userId: query.userId } : {} },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: { $cond: [{ $eq: ['$isExpense', false] }, '$value', 0] } },
          totalExpense: { $sum: { $cond: [{ $eq: ['$isExpense', true] }, '$value', 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          totalIncome: 1,
          totalExpense: 1,
          totalBalance: { $subtract: ['$totalIncome', '$totalExpense'] }
        }
      }
    ];

    const dataBalance = await Transaction.aggregate(pipeline);
    const dataTransactions = await getter(Transaction, query, req, res, [...Transaction.getFields('cp')]);

    const response = {
      transactions: dataTransactions,
      balance: dataBalance[0] || { totalIncome: 0, totalExpense: 0, totalBalance: 0 }
    };

    return next(SendData(response));
  } catch (err) {
    return next(ServerError(err));
  }
};

module.exports.create = async (req, { locals: { user } }, next) => {
  try {
    const data = new Transaction({
      ...req.body,
      userId: user.id
    });

    data.__history = {
      user: user.id,
      affiliate: data._id,
      event: 'create',
      method: 'create'
    };

    await data.save();

    return next(SendData(data.response('cp')));
  } catch (err) {
    return next(ServerError(err));
  }
};
