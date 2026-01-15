
const paymentService = require('../services/paymentService');
const currencyService = require('../services/currencyService')

function fund(req, res){
    try{
        const {amt} = req.body;
        const {username} = req.user;
        if(!amt){
            return res.status(400).json({error: "Amount is required"});
        }

        const result = paymentService.fundAccount(username, Number(amt));
        res.status(200).json(result);
    }
    catch(err){
        res.status(400).json({error: err.message})
    }
}


function pay(req, res){
    try{
        const {to, amt} = req.body;
        const {username} = req.user;

        if(!to){
            return res.status(400).json({error: "Recipient username is required"});
        }
        if(!amt){
            return res.status(400).json({error: "Amount is required"});
        }

        const result = paymentService.payUser(username, to, Number(amt));

        res.status(200).json(result);
    }
    catch(err){
        res.status(400).json({error : err.message});
    }
}


async function balance(req, res){
    try{
        const {username} = req.user;
        const currency = req.query.currency || "INR";

        const {balance} = paymentService.getBalance(username);
        const converted = await currencyService.convertINR(balance, currency);
        res.status(200).json({balance : converted, currency});
    }
    catch(err){
        res.status(400).json({error : err.message});
    }
}


function statement(req, res){
    try{
        const {username} = req.user;
        const stmt = paymentService.getTransactions(username);
        res.status(200).json(stmt);
    }
    catch(err){
        res.status(400).json({error : err.message});
    }
}


module.exports = {
    fund, pay, balance, statement
}
