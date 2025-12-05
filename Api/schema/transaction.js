module.exports = {
  createTransaction: {
    $id: 'createTransaction',
    type: 'object',
    properties: {
      value: { type: 'number', minimum: 1, maximum: 99999 },
      userId: { $ref: 'objectId' },
      isExpense: { type: 'boolean' },
      description: { type: 'string', maxLength: 120 },
      date: { type: 'string', format: 'date' }
    },
    required: ['userId', 'value', 'isExpense'],
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
      date: { type: 'string', format: 'date' }
    },
    required: [],
    additionalProperties: false
  }
};
