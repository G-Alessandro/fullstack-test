const mongoose = require('mongoose');
const softDelete = require('../helpers/softDelete');
const dbFields = require('../helpers/dbFields');
const mongooseHistory = require('../helpers/mongooseHistory');

const { Schema } = mongoose;

const schema = Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    value: { type: Number, min: 0.01, max: 99999, required: true },
    isExpense: { type: Boolean, required: true },
    description: { type: String, maxLength: 120 },
    date: { type: Date, required: true, default: Date.now }
  },
  {
    timestamps: true
  }
);

schema.plugin(softDelete);

schema.plugin(dbFields, {
  fields: {
    public: ['_id', 'userId', 'value', 'isExpense', 'description', 'date', 'createdAt'],
    listing: ['_id', 'userId', 'value', 'isExpense', 'description', 'date', 'createdAt'],
    cp: ['_id', 'userId', 'value', 'isExpense', 'description', 'date', 'updatedAt', 'createdAt']
  }
});

schema.plugin(
  mongooseHistory({
    mongoose,
    modelName: 'balance_h',
    userCollection: 'User',
    accountCollection: 'Company',
    userFieldName: 'user',
    accountFieldName: 'company',
    noDiffSaveOnMethods: []
  })
);

module.exports = mongoose.model('Transaction', schema);
