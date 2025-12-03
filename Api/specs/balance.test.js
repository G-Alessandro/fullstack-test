const supertest = require('supertest');
const app = require('../app');
const db = require('../db/connect-test');
const User = require('../models/user');
const Company = require('../models/company');
const { genereteAuthToken } = require('../helpers/auth');

const agent = supertest.agent(app);

let company1;

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
  return Promise.all([Company1Creation()]);
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

  describe('POST /balance', () => {
    test('Create a balance with all fields', () =>
      agent
        .post('/balance')
        .set('Cookie', `accessToken=${token}`)
        .send({
          userId: superuser._id.toString(),
          value: 100,
          isExpense: false,
          description: 'Weekly food shopping',
          date: '2025-01-14'
        })
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            _id: expect.any(String),
            userId: superuser._id.toString(),
            value: 100,
            isExpense: false,
            description: 'Weekly food shopping',
            date: new Date('2025-01-14').toISOString(),
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          })
        ));

    test('Create balance with invalid userId', () =>
      agent
        .post('/balance')
        .set('Cookie', `accessToken=${token}`)
        .send({
          userId: 'test',
          value: 100,
          isExpense: false,
          description: 'Weekly food shopping',
          date: '2025-01-14'
        })
        .expect(400)
        .then(res =>
          expect(res.body).toStrictEqual({
            error: 200,
            message: 'Validation error',
            data: '/userId'
          })
        ));

    test('Create balance with invalid value', () =>
      agent
        .post('/balance')
        .set('Cookie', `accessToken=${token}`)
        .send({
          userId: superuser._id.toString(),
          value: 'test',
          isExpense: false,
          description: 'Weekly food shopping',
          date: '2025-01-14'
        })
        .expect(400)
        .then(res =>
          expect(res.body).toStrictEqual({
            error: 200,
            message: 'Validation error',
            data: '/value'
          })
        ));

    test('Create balance with invalid value length', () =>
      agent
        .post('/balance')
        .set('Cookie', `accessToken=${token}`)
        .send({
          userId: superuser._id.toString(),
          value: 100000,
          isExpense: false,
          description: 'Weekly food shopping',
          date: '2025-01-14'
        })
        .expect(400)
        .then(res =>
          expect(res.body).toStrictEqual({
            error: 200,
            message: 'Validation error',
            data: '/value'
          })
        ));

    test('Create balance with invalid isExpense', () =>
      agent
        .post('/balance')
        .set('Cookie', `accessToken=${token}`)
        .send({
          userId: superuser._id.toString(),
          value: 100,
          isExpense: 'test',
          description: 'Weekly food shopping',
          date: '2025-01-14'
        })
        .expect(400)
        .then(res =>
          expect(res.body).toStrictEqual({
            error: 200,
            message: 'Validation error',
            data: '/isExpense'
          })
        ));

    test('Create balance with invalid description', () =>
      agent
        .post('/balance')
        .set('Cookie', `accessToken=${token}`)
        .send({
          userId: superuser._id.toString(),
          value: 100,
          isExpense: false,
          description: 'a'.repeat(121),
          date: '2025-01-14'
        })
        .expect(400)
        .then(res =>
          expect(res.body).toStrictEqual({
            error: 200,
            message: 'Validation error',
            data: '/description'
          })
        ));

    test('Create balance with invalid date', () =>
      agent
        .post('/balance')
        .set('Cookie', `accessToken=${token}`)
        .send({
          userId: superuser._id.toString(),
          value: 100,
          isExpense: false,
          description: 'Weekly food shopping',
          date: 'test'
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
});

describe('Role: admin', () => {
  let token;
  let admin;
  beforeEach(() => {
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

      token = genereteAuthToken(admin).token;
    };

    return AdminCreation();
  });

  describe('POST /balance', () => {
    test('Create a balance with all fields', () =>
      agent
        .post('/balance')
        .set('Cookie', `accessToken=${token}`)
        .send({
          userId: admin._id.toString(),
          value: 100,
          isExpense: false,
          description: 'Weekly food shopping',
          date: '2025-01-14'
        })
        .expect(200)
        .then(res =>
          expect(res.body).toStrictEqual({
            _id: expect.any(String),
            userId: admin._id.toString(),
            value: 100,
            isExpense: false,
            description: 'Weekly food shopping',
            date: new Date('2025-01-14').toISOString(),
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          })
        ));

    test('Create balance with invalid userId', () =>
      agent
        .post('/balance')
        .set('Cookie', `accessToken=${token}`)
        .send({
          userId: 'test',
          value: 100,
          isExpense: false,
          description: 'Weekly food shopping',
          date: '2025-01-14'
        })
        .expect(400)
        .then(res =>
          expect(res.body).toStrictEqual({
            error: 200,
            message: 'Validation error',
            data: '/userId'
          })
        ));

    test('Create balance with invalid value', () =>
      agent
        .post('/balance')
        .set('Cookie', `accessToken=${token}`)
        .send({
          userId: admin._id.toString(),
          value: 'test',
          isExpense: false,
          description: 'Weekly food shopping',
          date: '2025-01-14'
        })
        .expect(400)
        .then(res =>
          expect(res.body).toStrictEqual({
            error: 200,
            message: 'Validation error',
            data: '/value'
          })
        ));

    test('Create balance with invalid value length', () =>
      agent
        .post('/balance')
        .set('Cookie', `accessToken=${token}`)
        .send({
          userId: admin._id.toString(),
          value: 100000,
          isExpense: false,
          description: 'Weekly food shopping',
          date: '2025-01-14'
        })
        .expect(400)
        .then(res =>
          expect(res.body).toStrictEqual({
            error: 200,
            message: 'Validation error',
            data: '/value'
          })
        ));

    test('Create balance with invalid isExpense', () =>
      agent
        .post('/balance')
        .set('Cookie', `accessToken=${token}`)
        .send({
          userId: admin._id.toString(),
          value: 100,
          isExpense: 'test',
          description: 'Weekly food shopping',
          date: '2025-01-14'
        })
        .expect(400)
        .then(res =>
          expect(res.body).toStrictEqual({
            error: 200,
            message: 'Validation error',
            data: '/isExpense'
          })
        ));

    test('Create balance with invalid description', () =>
      agent
        .post('/balance')
        .set('Cookie', `accessToken=${token}`)
        .send({
          userId: admin._id.toString(),
          value: 100,
          isExpense: false,
          description: 'a'.repeat(121),
          date: '2025-01-14'
        })
        .expect(400)
        .then(res =>
          expect(res.body).toStrictEqual({
            error: 200,
            message: 'Validation error',
            data: '/description'
          })
        ));

    test('Create balance with invalid date', () =>
      agent
        .post('/balance')
        .set('Cookie', `accessToken=${token}`)
        .send({
          userId: admin._id.toString(),
          value: 100,
          isExpense: false,
          description: 'Weekly food shopping',
          date: 'test'
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

  describe('POST /balance', () => {
    test('Create a balance not allowed', () =>
      agent
        .post('/balance')
        .set('Cookie', `accessToken=${token}`)
        .send({
          userId: user._id.toString(),
          value: 100,
          isExpense: false,
          description: 'Weekly food shopping',
          date: '2025-01-14'
        })
        .expect(403));
  });
});
