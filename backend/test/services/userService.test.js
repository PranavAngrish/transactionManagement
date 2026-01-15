const { expect } = require('../setup');
const userService = require('../../services/userService');
const { users } = require('../../db/store');

describe('User Service', () => {
  beforeEach(() => {
    users.clear();
  });

  describe('register()', () => {
    it('should register a new user successfully', async () => {
      const user = await userService.register('testuser', 'password123');
      
      expect(user).to.have.property('username', 'testuser');
      expect(user).to.have.property('passwordHash');
      expect(user).to.have.property('balance', 0);
      expect(user).to.have.property('transactions');
      expect(user.transactions).to.be.an('array').that.is.empty;
    });

    it('should throw error if username is missing', async () => {
      try {
        await userService.register('', 'password123');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.equal('Username and Password required');
      }
    });

    it('should throw error if password is missing', async () => {
      try {
        await userService.register('testuser', '');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.equal('Username and Password required');
      }
    });

    it('should throw error if user already exists', async () => {
      await userService.register('testuser', 'password123');
      
      try {
        await userService.register('testuser', 'newpassword');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.equal('User already exists');
      }
    });

    it('should hash the password', async () => {
      const user = await userService.register('testuser', 'password123');
      expect(user.passwordHash).to.not.equal('password123');
      expect(user.passwordHash).to.have.lengthOf.at.least(50);
    });
  });
});