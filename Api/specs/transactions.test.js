const supertest = require('supertest');
const app = require('../app');
const db = require('../db/connect-test');
const User = require('../models/user');
const Company = require('../models/company');
const Transaction = require('../models/transaction');

const { genereteAuthToken } = require('../helpers/auth');

const agent = supertest.agent(app);

let admin;
let adminToken;
let company1;
let transaction1;
let transaction2;
let transaction3;

beforeAll(async () => await db.connect());
beforeEach(async () => {
  await db.clear();
  const Company1Creation = async () => {
    company1 = await new Company({
      name: 'Company1',
      pic: 'companypic',
      lang: 'EN',
      zipcode: '12345',
      country: 'IT',
      address: 'Via XYZ 123',
      phone: { prefix: '+39', number: '1234567890', country: 'IT' },
      type: 'type1',
      vatNumber: 'IT1234567890'
    }).save();
  };

  const AdminCreation = async () => {
    admin = await new User({
      name: 'Admin',
      lastname: 'Admin',
      email: 'admin@meblabs.com',
      password: 'testtest',
      active: true,
      company: {
        id: company1.id,
        name: company1.name,
        roles: ['admin']
      }
    }).save();

    adminToken = genereteAuthToken(admin).token;
  };

  const Balance1Creation = async () => {
    transaction1 = await new Transaction({
      userId: admin._id.toString(),
      value: 100,
      isExpense: false,
      description: 'Weekly food shopping',
      date: '2025-01-14'
    }).save();
  };
  const Balance2Creation = async () => {
    transaction2 = await new Transaction({
      userId: admin._id.toString(),
      value: 120,
      isExpense: false,
      description: 'Monthly salary',
      date: '2025-01-27'
    }).save();
  };
  const Balance3Creation = async () => {
    transaction3 = await new Transaction({
      userId: admin._id.toString(),
      value: 250,
      isExpense: true,
      description: 'Dinner with friends',
      date: '2025-01-31'
    }).save();
  };
  return Company1Creation()
    .then(() => AdminCreation())
    .then(() => Promise.all([Balance1Creation(), Balance2Creation(), Balance3Creation()]));
});
afterEach(async () => await jest.clearAllMocks());
afterAll(async () => await db.close());

describe('Role: superadmin', () => {
  let token;
  let superuser;
  beforeEach(() => {
    const SuperuserCreation = async () => {
      superuser = await new User({
        name: 'Super',
        lastname: 'Admin',
        email: 'superuser@meblabs.com',
        password: 'testtest',
        roles: ['superuser'],
        active: true
      }).save();

      token = genereteAuthToken(superuser).token;
    };

    return SuperuserCreation();
  });

  describe('GET /transactions', () => {
    test('Get all transactions', () =>
      agent
        .get('/transactions?sorter=date')
        .set('Cookie', `accessToken=${token}`)
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            transactions: [
              {
                _id: transaction1.id,
                userId: expect.any(String),
                value: 100,
                isExpense: false,
                description: 'Weekly food shopping',
                date: new Date('2025-01-14').toISOString(),
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
              },
              {
                _id: transaction2.id,
                userId: expect.any(String),
                value: 120,
                isExpense: false,
                description: 'Monthly salary',
                date: new Date('2025-01-27').toISOString(),
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
              },
              {
                _id: transaction3.id,
                userId: expect.any(String),
                value: 250,
                isExpense: true,
                description: 'Dinner with friends',
                date: new Date('2025-01-31').toISOString(),
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
              }
            ],
            balance: {
              totalIncome: 220,
              totalExpense: 250,
              totalBalance: -30
            }
          })
        ));

    test('Get all transactions filtered by isExpense', () =>
      agent
        .get('/transactions?sorter=date&isExpense=false')
        .set('Cookie', `accessToken=${token}`)
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            transactions: [
              {
                _id: transaction1.id,
                userId: expect.any(String),
                value: 100,
                isExpense: false,
                description: 'Weekly food shopping',
                date: new Date('2025-01-14').toISOString(),
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
              },
              {
                _id: transaction2.id,
                userId: expect.any(String),
                value: 120,
                isExpense: false,
                description: 'Monthly salary',
                date: new Date('2025-01-27').toISOString(),
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
              }
            ],
            balance: {
              totalIncome: 220,
              totalExpense: 250,
              totalBalance: -30
            }
          })
        ));

    test('Get all transactions filtered by description', () =>
      agent
        .get('/transactions?sorter=date&filter=mon')
        .set('Cookie', `accessToken=${token}`)
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            transactions: [
              {
                _id: transaction2.id,
                userId: expect.any(String),
                value: 120,
                isExpense: false,
                description: 'Monthly salary',
                date: new Date('2025-01-27').toISOString(),
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
              }
            ],
            balance: {
              totalIncome: 220,
              totalExpense: 250,
              totalBalance: -30
            }
          })
        ));

    test('Get all transactions sorted by decreasing value', () =>
      agent
        .get('/transactions?sorter=-value&isExpense=false')
        .set('Cookie', `accessToken=${token}`)
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            transactions: [
              {
                _id: transaction2.id,
                userId: expect.any(String),
                value: 120,
                isExpense: false,
                description: 'Monthly salary',
                date: new Date('2025-01-27').toISOString(),
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
              },
              {
                _id: transaction1.id,
                userId: expect.any(String),
                value: 100,
                isExpense: false,
                description: 'Weekly food shopping',
                date: new Date('2025-01-14').toISOString(),
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
              }
            ],
            balance: {
              totalIncome: 220,
              totalExpense: 250,
              totalBalance: -30
            }
          })
        ));
  });

  describe('POST /transactions', () => {
    test('Create a transaction with all fields', () =>
      agent
        .post('/transactions')
        .set('Cookie', `accessToken=${token}`)
        .send({
          value: '100',
          isExpense: 'false',
          description: 'Weekly food shopping',
          date: '2025-12-06T19:14:38.600Z'
        })
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            _id: expect.any(String),
            userId: superuser._id.toString(),
            value: 100,
            isExpense: false,
            description: 'Weekly food shopping',
            date: '2025-12-06T19:14:38.600Z',
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          })
        ));

    test('Create transaction with invalid value', () =>
      agent
        .post('/transactions')
        .set('Cookie', `accessToken=${token}`)
        .send({
          value: 'test',
          isExpense: 'false',
          description: 'Weekly food shopping',
          date: '2025-12-06T19:14:38.600Z'
        })
        .expect(400)
        .then(res =>
          expect(res.body).toStrictEqual({
            error: 200,
            message: 'Validation error',
            data: '/value'
          })
        ));

    test('Create transaction with invalid value length', () =>
      agent
        .post('/transactions')
        .set('Cookie', `accessToken=${token}`)
        .send({
          value: '100000',
          isExpense: 'false',
          description: 'Weekly food shopping',
          date: '2025-12-06T19:14:38.600Z'
        })
        .expect(400)
        .then(res =>
          expect(res.body).toStrictEqual({
            error: 200,
            message: 'Validation error',
            data: '/value'
          })
        ));

    test('Create transaction with invalid isExpense', () =>
      agent
        .post('/transactions')
        .set('Cookie', `accessToken=${token}`)
        .send({
          value: '100',
          isExpense: 'test',
          description: 'Weekly food shopping',
          date: '2025-12-06T19:14:38.600Z'
        })
        .expect(400)
        .then(res =>
          expect(res.body).toStrictEqual({
            error: 200,
            message: 'Validation error',
            data: '/isExpense'
          })
        ));

    test('Create transaction with invalid description', () =>
      agent
        .post('/transactions')
        .set('Cookie', `accessToken=${token}`)
        .send({
          value: '100',
          isExpense: 'false',
          description: 'a'.repeat(121),
          date: '2025-12-06T19:14:38.600Z'
        })
        .expect(400)
        .then(res =>
          expect(res.body).toStrictEqual({
            error: 200,
            message: 'Validation error',
            data: '/description'
          })
        ));

    test('Create transaction with invalid date', () =>
      agent
        .post('/transactions')
        .set('Cookie', `accessToken=${token}`)
        .send({
          value: '100',
          isExpense: 'false',
          description: 'Weekly food shopping',
          date: '2025-12-06T19:14:38.600Zzz'
        })
        .expect(400)
        .then(res =>
          expect(res.body).toStrictEqual({
            error: 200,
            message: 'Validation error',
            data: '/date'
          })
        ));
  });

  describe('GET /transactions/:id', () => {
    test('Get specific transaction', () =>
      agent
        .get(`/transactions/${transaction1.id}`)
        .set('Cookie', `accessToken=${token}`)
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            _id: transaction1.id,
            userId: expect.any(String),
            value: 100,
            isExpense: false,
            description: 'Weekly food shopping',
            date: new Date('2025-01-14').toISOString(),
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          })
        ));
  });

  describe('PATCH /transactions/:id', () => {
    test('Update transaction value and description', () =>
      agent
        .patch(`/transactions/${transaction1.id}`)
        .send({ value: 500, description: 'test' })
        .set('Cookie', `accessToken=${token}`)
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            _id: transaction1.id,
            userId: expect.any(String),
            value: 500,
            isExpense: false,
            description: 'test',
            date: new Date('2025-01-14').toISOString(),
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          })
        ));
  });

  describe('DELETE /transactions/:id', () => {
    test('Deleting transaction)', async () =>
      agent
        .delete(`/transactions/${transaction1.id}`)
        .set('Cookie', `accessToken=${token}`)
        .expect(200)
        .then(res => expect(res.body).toStrictEqual({ message: 'Transaction deleted successfully' })));
  });
});

describe('Role: admin', () => {
  describe('GET /transactions', () => {
    test('Get all transactions', () =>
      agent
        .get('/transactions?sorter=date')
        .set('Cookie', `accessToken=${adminToken}`)
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            transactions: [
              {
                _id: transaction1.id,
                userId: expect.any(String),
                value: 100,
                isExpense: false,
                description: 'Weekly food shopping',
                date: new Date('2025-01-14').toISOString(),
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
              },
              {
                _id: transaction2.id,
                userId: expect.any(String),
                value: 120,
                isExpense: false,
                description: 'Monthly salary',
                date: new Date('2025-01-27').toISOString(),
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
              },
              {
                _id: transaction3.id,
                userId: expect.any(String),
                value: 250,
                isExpense: true,
                description: 'Dinner with friends',
                date: new Date('2025-01-31').toISOString(),
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
              }
            ],
            balance: {
              totalIncome: 220,
              totalExpense: 250,
              totalBalance: -30
            }
          })
        ));

    test('Get all transactions filtered by isExpense', () =>
      agent
        .get('/transactions?sorter=date&isExpense=false')
        .set('Cookie', `accessToken=${adminToken}`)
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            transactions: [
              {
                _id: transaction1.id,
                userId: expect.any(String),
                value: 100,
                isExpense: false,
                description: 'Weekly food shopping',
                date: new Date('2025-01-14').toISOString(),
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
              },
              {
                _id: transaction2.id,
                userId: expect.any(String),
                value: 120,
                isExpense: false,
                description: 'Monthly salary',
                date: new Date('2025-01-27').toISOString(),
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
              }
            ],
            balance: {
              totalIncome: 220,
              totalExpense: 250,
              totalBalance: -30
            }
          })
        ));

    test('Get all transactions filtered by description', () =>
      agent
        .get('/transactions?sorter=date&filter=mon')
        .set('Cookie', `accessToken=${adminToken}`)
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            transactions: [
              {
                _id: transaction2.id,
                userId: expect.any(String),
                value: 120,
                isExpense: false,
                description: 'Monthly salary',
                date: new Date('2025-01-27').toISOString(),
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
              }
            ],
            balance: {
              totalIncome: 220,
              totalExpense: 250,
              totalBalance: -30
            }
          })
        ));

    test('Get all transactions sorted by decreasing value', () =>
      agent
        .get('/transactions?sorter=-value&isExpense=false')
        .set('Cookie', `accessToken=${adminToken}`)
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            transactions: [
              {
                _id: transaction2.id,
                userId: expect.any(String),
                value: 120,
                isExpense: false,
                description: 'Monthly salary',
                date: new Date('2025-01-27').toISOString(),
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
              },
              {
                _id: transaction1.id,
                userId: expect.any(String),
                value: 100,
                isExpense: false,
                description: 'Weekly food shopping',
                date: new Date('2025-01-14').toISOString(),
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
              }
            ],
            balance: {
              totalIncome: 220,
              totalExpense: 250,
              totalBalance: -30
            }
          })
        ));
  });

  describe('POST /transactions', () => {
    test('Create a transaction with all fields', () =>
      agent
        .post('/transactions')
        .set('Cookie', `accessToken=${adminToken}`)
        .send({
          value: '100',
          isExpense: 'false',
          description: 'Weekly food shopping',
          date: '2025-12-06T19:14:38.600Z'
        })
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            _id: expect.any(String),
            userId: admin._id.toString(),
            value: 100,
            isExpense: false,
            description: 'Weekly food shopping',
            date: '2025-12-06T19:14:38.600Z',
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          })
        ));

    test('Create transaction with invalid value', () =>
      agent
        .post('/transactions')
        .set('Cookie', `accessToken=${adminToken}`)
        .send({
          value: 'test',
          isExpense: 'false',
          description: 'Weekly food shopping',
          date: '2025-12-06T19:14:38.600Z'
        })
        .expect(400)
        .then(res =>
          expect(res.body).toStrictEqual({
            error: 200,
            message: 'Validation error',
            data: '/value'
          })
        ));

    test('Create transaction with invalid value length', () =>
      agent
        .post('/transactions')
        .set('Cookie', `accessToken=${adminToken}`)
        .send({
          value: '100000',
          isExpense: 'false',
          description: 'Weekly food shopping',
          date: '2025-12-06T19:14:38.600Z'
        })
        .expect(400)
        .then(res =>
          expect(res.body).toStrictEqual({
            error: 200,
            message: 'Validation error',
            data: '/value'
          })
        ));

    test('Create transaction with invalid isExpense', () =>
      agent
        .post('/transactions')
        .set('Cookie', `accessToken=${adminToken}`)
        .send({
          value: '100',
          isExpense: 'test',
          description: 'Weekly food shopping',
          date: '2025-12-06T19:14:38.600Z'
        })
        .expect(400)
        .then(res =>
          expect(res.body).toStrictEqual({
            error: 200,
            message: 'Validation error',
            data: '/isExpense'
          })
        ));

    test('Create transaction with invalid description', () =>
      agent
        .post('/transactions')
        .set('Cookie', `accessToken=${adminToken}`)
        .send({
          value: '100',
          isExpense: 'false',
          description: 'a'.repeat(121),
          date: '2025-12-06T19:14:38.600Z'
        })
        .expect(400)
        .then(res =>
          expect(res.body).toStrictEqual({
            error: 200,
            message: 'Validation error',
            data: '/description'
          })
        ));

    test('Create transaction with invalid date', () =>
      agent
        .post('/transactions')
        .set('Cookie', `accessToken=${adminToken}`)
        .send({
          value: '100',
          isExpense: 'false',
          description: 'Weekly food shopping',
          date: '2025-12-06T19:14:38.600Zzz'
        })
        .expect(400)
        .then(res =>
          expect(res.body).toStrictEqual({
            error: 200,
            message: 'Validation error',
            data: '/date'
          })
        ));
  });

  describe('GET /transactions/:id', () => {
    test('Get specific transaction', () =>
      agent
        .get(`/transactions/${transaction1.id}`)
        .set('Cookie', `accessToken=${adminToken}`)
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            _id: transaction1.id,
            userId: expect.any(String),
            value: 100,
            isExpense: false,
            description: 'Weekly food shopping',
            date: new Date('2025-01-14').toISOString(),
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          })
        ));

    test('Get other users specific transaction not allowed', async () => {
      const tmpUser = await new User({
        name: 'Tmp',
        lastname: 'User',
        email: 'tmp@tmp.com',
        password: 'testtest',
        company: { id: company1.id, name: 'Company1', roles: ['user'] }
      }).save();

      const tmpTransactions = await new Transaction({
        userId: tmpUser._id.toString(),
        value: 100,
        isExpense: false,
        description: 'Weekly food shopping',
        date: '2025-01-14'
      }).save();

      return agent.get(`/transactions/${tmpTransactions.id}`).set('Cookie', `accessToken=${adminToken}`).expect(401);
    });
  });

  describe('PATCH /transactions/:id', () => {
    test('Update transaction value and description', () =>
      agent
        .patch(`/transactions/${transaction1.id}`)
        .send({ value: 500, description: 'test' })
        .set('Cookie', `accessToken=${adminToken}`)
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            _id: transaction1.id,
            userId: expect.any(String),
            value: 500,
            isExpense: false,
            description: 'test',
            date: new Date('2025-01-14').toISOString(),
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          })
        ));

    test('Update other users transactions not allowed', async () => {
      const tmpUser = await new User({
        name: 'Tmp',
        lastname: 'User',
        email: 'tmp@tmp.com',
        password: 'testtest',
        company: { id: company1.id, name: 'Company1', roles: ['user'] }
      }).save();

      const tmpTransactions = await new Transaction({
        userId: tmpUser._id.toString(),
        value: 100,
        isExpense: false,
        description: 'Weekly food shopping',
        date: '2025-01-14'
      }).save();

      return agent
        .patch(`/transactions/${tmpTransactions.id}`)
        .send({ value: 500, description: 'test' })
        .set('Cookie', `accessToken=${adminToken}`)
        .expect(401);
    });
  });

  describe('DELETE /transactions/:id', () => {
    test('Deleting transaction', async () =>
      agent
        .delete(`/transactions/${transaction1.id}`)
        .set('Cookie', `accessToken=${adminToken}`)
        .expect(200)
        .then(res => expect(res.body).toStrictEqual({ message: 'Transaction deleted successfully' })));

    test('Cannot delete other users transactions', async () => {
      const tmpUser = await new User({
        name: 'Tmp',
        lastname: 'User',
        email: 'tmp@tmp.com',
        password: 'testtest',
        company: { id: company1.id, name: 'Company1', roles: ['user'] }
      }).save();

      const tmpTransactions = await new Transaction({
        userId: tmpUser._id.toString(),
        value: 100,
        isExpense: false,
        description: 'Weekly food shopping',
        date: '2025-01-14'
      }).save();

      return agent.delete(`/companies/${tmpTransactions.id}`).set('Cookie', `accessToken=${adminToken}`).expect(403);
    });
  });
});

describe('Role: user', () => {
  let token;
  let user;
  beforeEach(() => {
    const UserCreation = async () => {
      user = await new User({
        name: 'User',
        lastname: 'User',
        email: 'user@meblabs.com',
        password: 'testtest',
        active: true,
        company: {
          id: company1.id,
          name: company1.name,
          roles: ['user']
        }
      }).save();

      token = genereteAuthToken(user).token;
    };

    return UserCreation();
  });

  describe('GET /transactions', () => {
    test('Get a transactions not allowed', () =>
      agent.get('/transactions?sorter=date').set('Cookie', `accessToken=${token}`).expect(403));
  });

  describe('POST /transactions', () => {
    test('Create a transaction not allowed', () =>
      agent
        .post('/transactions')
        .set('Cookie', `accessToken=${token}`)
        .send({
          value: '100',
          isExpense: 'false',
          description: 'Weekly food shopping',
          date: '2025-12-06T19:14:38.600Zzz'
        })
        .expect(403));
  });

  describe('GET /transactions/:id', () => {
    test('Get specific transaction not allowed', async () =>
      agent.get(`/transactions/${transaction1.id}`).set('Cookie', `accessToken=${token}`).expect(403));
  });

  describe('PATCH /transactions/:id', () => {
    test('Update transaction not allowed', () =>
      agent
        .patch(`/transactions/${transaction1.id}`)
        .send({ value: 500, description: 'test' })
        .set('Cookie', `accessToken=${token}`)
        .expect(403));
  });

  describe('DELETE /transactions/:id', () => {
    test('Deleting transaction not allowed', async () =>
      agent.delete(`/transactions/${transaction1.id}`).set('Cookie', `accessToken=${token}`).expect(403));
  });
});
