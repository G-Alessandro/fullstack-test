const { intersection } = require('../helpers/utils');
const Transaction = require('../models/transaction');

const transactionRbac = async (caller, resourceId, { authorizedRoles = [] }) => {
  const transaction = await Transaction.findById(resourceId);
  if (!transaction) return null;

  const { grants, company: userCompany = {}, roles: globalRoles } = caller;
  const { roles: companyRoles = [] } = userCompany;
  const roles = Array.from(new Set([...companyRoles, ...globalRoles]));

  if (grants?.type === 'any' || roles.includes('superuser')) return transaction;
  if (intersection(authorizedRoles, roles).length && transaction.userId.toString() === caller.id.toString()) {
    return transaction;
  }
  return false;
};

module.exports.canGetTransaction = (caller, resourceId) =>
  transactionRbac(caller, resourceId, { authorizedRoles: ['user'] });

module.exports.canUpdateTransaction = (caller, resourceId) =>
  transactionRbac(caller, resourceId, { authorizedRoles: ['user'] });

module.exports.canDeleteTransaction = (caller, resourceId) =>
  transactionRbac(caller, resourceId, { authorizedRoles: ['user'] });
