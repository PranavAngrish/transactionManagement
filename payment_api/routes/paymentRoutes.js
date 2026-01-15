const express = require('express');
const paymentController = require('../controllers/paymentController');
const {authenticate} = require('../middleware/auth')
const router = express.Router();



router.post('/fund',authenticate, paymentController.fund);
router.post('/pay',authenticate, paymentController.pay);
router.get('/bal', authenticate, paymentController.balance);
router.get('/stmt', authenticate, paymentController.statement);

module.exports = router;