const Balance = require('../models/balance');
const { SendData, ServerError } = require('../helpers/response');

module.exports.create = async (req, { locals: { user } }, next) => {
  try {
    const data = new Balance({
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
