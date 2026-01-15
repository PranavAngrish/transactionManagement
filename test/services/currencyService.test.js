
// test/services/currencyService.test.js
const currencyService = require('../../services/currencyService');
const nock = require('nock');
const { expect } = require('../setup');


describe('Currency Service', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  describe('convertINR()', () => {
    it('should return same amount for INR to INR', async () => {
      const result = await currencyService.convertINR(1000, 'INR');
      expect(result).to.equal(1000);
    });

    it('should convert INR to USD', async () => {
      nock('https://open.er-api.com')
        .get('/v6/latest/INR')
        .reply(200, {
          rates: {
            USD: 0.012,
            EUR: 0.011
          }
        });

      const result = await currencyService.convertINR(1000, 'USD');
      expect(result).to.equal(12);
    });

    it('should convert INR to EUR', async () => {
      nock('https://open.er-api.com')
        .get('/v6/latest/INR')
        .reply(200, {
          rates: {
            USD: 0.012,
            EUR: 0.011
          }
        });

      const result = await currencyService.convertINR(1000, 'EUR');
      expect(result).to.equal(11);
    });

    it('should throw error for unsupported currency', async () => {
      nock('https://open.er-api.com')
        .get('/v6/latest/INR')
        .reply(200, {
          rates: {
            USD: 0.012
          }
        });

      try {
        await currencyService.convertINR(1000, 'XYZ');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.equal('Currency conversion failed : Unsupported Currency');
      }
    });

    it('should throw error when API fails', async () => {
      nock('https://open.er-api.com')
        .get('/v6/latest/INR')
        .reply(500);

      try {
        await currencyService.convertINR(1000, 'USD');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('Currency conversion failed');
      }
    });
  });
});
