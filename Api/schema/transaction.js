module.exports = {
  createTransaction: {
    $id: 'createTransaction',
    type: 'object',
    properties: {
      value: { type: 'number', minimum: 1, maximum: 99999 },
      userId: { $ref: 'objectId' },
      isExpense: { type: 'boolean' },
      description: { type: 'string', maxLength: 120 },
      date: { type: 'string', format: 'date-time' }
    },
    required: ['value', 'isExpense', 'date'],
    additionalProperties: false
  },
  updateTransaction: {
    $id: 'updateTransaction',
    type: 'object',
    properties: {
      value: { type: 'number', minimum: 1, maximum: 99999 },
      userId: { $ref: 'objectId' },
      isExpense: { type: 'boolean' },
      description: { type: 'string', maxLength: 120 },
      date: { type: 'string', format: 'date-time' }
    },
    required: [],
    additionalProperties: false
  }
};
