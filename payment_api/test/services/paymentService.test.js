
const { expect } = require('../setup');
const paymentService = require('../../services/paymentService');
const { users } = require('../../db/store');


describe('Payment Service', () => {
  beforeEach(() => {
    users.clear();
    users.set('alice', {
      username: 'alice',
      passwordHash: 'hash',
      balance: 1000,
      transactions: []
    });
    users.set('bob', {
      username: 'bob',
      passwordHash: 'hash',
      balance: 500,
      transactions: []
    });
  });

  describe('fundAccount()', () => {
    it('should add funds to user account', () => {
      const result = paymentService.fundAccount('alice', 500);
      
      expect(result.balance).to.equal(1500);
      const user = users.get('alice');
      expect(user.balance).to.equal(1500);
      expect(user.transactions).to.have.lengthOf(1);
      expect(user.transactions[0]).to.include({
        kind: 'credit',
        amt: 500,
        updated_bal: 1500
      });
    });

    it('should throw error for negative amount', () => {
      try {
        paymentService.fundAccount('alice', -100);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.equal('Amount must be positive');
      }
    });

    it('should throw error for zero amount', () => {
      try {
        paymentService.fundAccount('alice', 0);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.equal('Amount must be positive');
      }
    });

    it('should create transaction record with timestamp', () => {
      paymentService.fundAccount('alice', 100);
      const user = users.get('alice');
      
      expect(user.transactions[0]).to.have.property('id');
      expect(user.transactions[0]).to.have.property('timestamp');
      expect(user.transactions[0].timestamp).to.be.a('string');
    });
  });

  describe('payUser()', () => {
    it('should transfer money between users', () => {
      const result = paymentService.payUser('alice', 'bob', 200);
      
      expect(result.balance).to.equal(800);
      
      const sender = users.get('alice');
      const receiver = users.get('bob');
      
      expect(sender.balance).to.equal(800);
      expect(receiver.balance).to.equal(700);
      
      expect(sender.transactions).to.have.lengthOf(1);
      expect(receiver.transactions).to.have.lengthOf(1);
      
      expect(sender.transactions[0]).to.include({
        kind: 'debit',
        amt: 200
      });
      
      expect(receiver.transactions[0]).to.include({
        kind: 'credit',
        amt: 200
      });
    });

    it('should throw error for insufficient funds', () => {
      try {
        paymentService.payUser('alice', 'bob', 2000);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.equal('Insufficient funds');
      }
    });

    it('should throw error if recipient does not exist', () => {
      try {
        paymentService.payUser('alice', 'charlie', 100);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.equal('Recipient does not exist');
      }
    });

    it('should throw error for negative amount', () => {
      try {
        paymentService.payUser('alice', 'bob', -50);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.equal('Amount must be positive');
      }
    });

    it('should throw error for zero amount', () => {
      try {
        paymentService.payUser('alice', 'bob', 0);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.equal('Amount must be positive');
      }
    });
  });

  describe('getBalance()', () => {
    it('should return user balance', () => {
      const result = paymentService.getBalance('alice');
      expect(result).to.deep.equal({ balance: 1000 });
    });

    it('should return correct balance after transactions', () => {
      paymentService.fundAccount('alice', 500);
      const result = paymentService.getBalance('alice');
      expect(result.balance).to.equal(1500);
    });
  });

  describe('getTransactions()', () => {
    it('should return empty array for new user with no transactions', () => {
      const transactions = paymentService.getTransactions('alice');
      expect(transactions).to.be.an('array').that.is.empty;
    });

    it('should return all user transactions', () => {
      paymentService.fundAccount('alice', 500);
      paymentService.payUser('alice', 'bob', 200);
      
      const transactions = paymentService.getTransactions('alice');
      expect(transactions).to.have.lengthOf(2);
      expect(transactions[0].kind).to.equal('debit');
      expect(transactions[1].kind).to.equal('credit');
    });

    it('should return transactions in correct order (newest first)', () => {
      paymentService.fundAccount('alice', 100);
      paymentService.fundAccount('alice', 200);
      
      const transactions = paymentService.getTransactions('alice');
      expect(transactions[0].amt).to.equal(200);
      expect(transactions[1].amt).to.equal(100);
    });
  });
});