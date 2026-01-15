const { chai, expect } = require('../setup');
const app = require('../../app');
const { users } = require('../../db/store');
const userService = require('../../services/userService');
const paymentService = require('../../services/paymentService');
const nock = require('nock');


describe('API Integration Tests', () => {
  let server;

  before((done) => {
    server = app.listen(3001, done);
  });

  after((done) => {
  if (server && server.listening) {
    server.close(done);
  } else {
    done();
  }
});

  beforeEach(() => {
    users.clear();
  });

  describe('POST /api/users/register', () => {
    it('should register a new user', (done) => {
      chai.request(server)
        .post('/api/users/register')
        .send({ username: 'testuser', password: 'test123' })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('username', 'testuser');
          expect(res.body).to.have.property('balance', 0);
          done();
        });
    });

    it('should reject duplicate username', (done) => {
      chai.request(server)
        .post('/api/users/register')
        .send({ username: 'testuser', password: 'test123' })
        .end(() => {
          chai.request(server)
            .post('/api/users/register')
            .send({ username: 'testuser', password: 'newpass' })
            .end((err, res) => {
              expect(res).to.have.status(400);
              expect(res.body).to.have.property('error');
              done();
            });
        });
    });
  });

  describe('Authentication', () => {
    beforeEach(async () => {
      await userService.register('alice', 'alice123');
    });

    it('should reject request without authentication', (done) => {
      chai.request(server)
        .get('/api/payments/bal')
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body.error).to.equal('Missing authentication header');
          done();
        });
    });

    it('should reject request with wrong password', (done) => {
      const auth = Buffer.from('alice:wrongpass').toString('base64');
      
      chai.request(server)
        .get('/api/payments/bal')
        .set('Authorization', `Basic ${auth}`)
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body.error).to.equal('Invalid credentials');
          done();
        });
    });

    it('should accept request with correct credentials', (done) => {
      const auth = Buffer.from('alice:alice123').toString('base64');
      
      chai.request(server)
        .get('/api/payments/bal')
        .set('Authorization', `Basic ${auth}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('balance', 0);
          done();
        });
    });
  });

  describe('POST /api/payments/fund', () => {
    beforeEach(async () => {
      await userService.register('alice', 'alice123');
    });

    it('should fund user account', (done) => {
      const auth = Buffer.from('alice:alice123').toString('base64');
      
      chai.request(server)
        .post('/api/payments/fund')
        .set('Authorization', `Basic ${auth}`)
        .send({ amt: 1000 })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.balance).to.equal(1000);
          done();
        });
    });

    it('should reject funding with missing amount', (done) => {
      const auth = Buffer.from('alice:alice123').toString('base64');
      
      chai.request(server)
        .post('/api/payments/fund')
        .set('Authorization', `Basic ${auth}`)
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.error).to.equal('Amount is required');
          done();
        });
    });

    it('should reject negative amount', (done) => {
      const auth = Buffer.from('alice:alice123').toString('base64');
      
      chai.request(server)
        .post('/api/payments/fund')
        .set('Authorization', `Basic ${auth}`)
        .send({ amt: -100 })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.error).to.equal('Amount must be positive');
          done();
        });
    });
  });

  describe('POST /api/payments/pay', () => {
    beforeEach(async () => {
      await userService.register('alice', 'alice123');
      await userService.register('bob', 'bob456');
      paymentService.fundAccount('alice', 1000);
    });

    it('should transfer money between users', (done) => {
      const auth = Buffer.from('alice:alice123').toString('base64');
      
      chai.request(server)
        .post('/api/payments/pay')
        .set('Authorization', `Basic ${auth}`)
        .send({ to: 'bob', amt: 200 })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.balance).to.equal(800);
          done();
        });
    });

    it('should reject payment without recipient', (done) => {
      const auth = Buffer.from('alice:alice123').toString('base64');
      
      chai.request(server)
        .post('/api/payments/pay')
        .set('Authorization', `Basic ${auth}`)
        .send({ amt: 200 })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.error).to.equal('Recipient username is required');
          done();
        });
    });

    it('should reject payment without amount', (done) => {
      const auth = Buffer.from('alice:alice123').toString('base64');
      
      chai.request(server)
        .post('/api/payments/pay')
        .set('Authorization', `Basic ${auth}`)
        .send({ to: 'bob' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.error).to.equal('Amount is required');
          done();
        });
    });

    it('should reject payment with insufficient funds', (done) => {
      const auth = Buffer.from('alice:alice123').toString('base64');
      
      chai.request(server)
        .post('/api/payments/pay')
        .set('Authorization', `Basic ${auth}`)
        .send({ to: 'bob', amt: 5000 })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.error).to.equal('Insufficient funds');
          done();
        });
    });

    it('should reject payment to non-existent user', (done) => {
      const auth = Buffer.from('alice:alice123').toString('base64');
      
      chai.request(server)
        .post('/api/payments/pay')
        .set('Authorization', `Basic ${auth}`)
        .send({ to: 'charlie', amt: 100 })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.error).to.equal('Recipient does not exist');
          done();
        });
    });
  });

  describe('GET /api/payments/bal', () => {
    beforeEach(async () => {
      await userService.register('alice', 'alice123');
      paymentService.fundAccount('alice', 1500);
    });

    it('should return balance in INR by default', (done) => {
      const auth = Buffer.from('alice:alice123').toString('base64');
      
      chai.request(server)
        .get('/api/payments/bal')
        .set('Authorization', `Basic ${auth}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.balance).to.equal(1500);
          expect(res.body.currency).to.equal('INR');
          done();
        });
    });

    it('should return balance in requested currency', (done) => {
      nock('https://open.er-api.com')
        .get('/v6/latest/INR')
        .reply(200, {
          rates: { USD: 0.012 }
        });

      const auth = Buffer.from('alice:alice123').toString('base64');
      
      chai.request(server)
        .get('/api/payments/bal?currency=USD')
        .set('Authorization', `Basic ${auth}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.balance).to.equal(18);
          expect(res.body.currency).to.equal('USD');
          done();
        });
    });
  });

  describe('GET /api/payments/stmt', () => {
    beforeEach(async () => {
      await userService.register('alice', 'alice123');
      await userService.register('bob', 'bob456');
      paymentService.fundAccount('alice', 1000);
      paymentService.payUser('alice', 'bob', 200);
    });

    it('should return transaction statement', (done) => {
      const auth = Buffer.from('alice:alice123').toString('base64');
      
      chai.request(server)
        .get('/api/payments/stmt')
        .set('Authorization', `Basic ${auth}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengthOf(2);
          expect(res.body[0]).to.have.property('kind', 'debit');
          expect(res.body[1]).to.have.property('kind', 'credit');
          done();
        });
    });
  });
});