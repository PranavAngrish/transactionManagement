const {users} = require("../db/store");
const {v4:uuid} = require("uuid");

function fundAccount(username, amt){
    if(amt <= 0) throw new Error("Amount must be positive");
    const user = users.get(username);
    user.balance += amt;

    user.transactions.unshift({
        id : uuid(),
        kind : "credit",
        amt,
        updated_bal : user.balance,
        timestamp : new Date().toISOString()
    });

    return { balance : user.balance };
}



function payUser(from, to, amt){
    if(amt <= 0) throw new Error("Amount must be positive");

    const sender = users.get(from);
    const receiver = users.get(to);

    if(!receiver) throw new Error("Recipient does not exist");
    if(sender.balance < amt) throw new Error("Insufficient funds");

    sender.balance -= amt;
    receiver.balance += amt;

    sender.transactions.unshift({
        id : uuid(),
        kind : "debit",
        amt,
        updated_bal : sender.balance,
        timestamp : new Date().toISOString()
    });

    receiver.transactions.unshift({
        id : uuid(),
        kind : "credit",
        amt,
        updated_bal : receiver.balance,
        timestamp : new Date().toISOString()
    });

    return { balance : sender.balance };
}


function getBalance(username){
    const user = users.get(username);
    return {balance : user.balance};
}


function getTransactions(username){
    const user = users.get(username);
    return user.transactions;
}


module.exports = {
    fundAccount,
    payUser,
    getBalance,
    getTransactions
}