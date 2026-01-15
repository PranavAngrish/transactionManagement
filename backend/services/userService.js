const { SALT_ROUNDS } = require('../config/constants');
const {users} = require('../db/store')
const bcrypt = require('bcrypt')

async function register(username, password){
    if(!username || !password) throw new Error("Username and Password required");
    if(users.has(username)) throw new Error("User already exists");

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = {username, passwordHash, balance : 0, transactions : []}

    users.set(username, user);

    return user;
}

module.exports = {register};