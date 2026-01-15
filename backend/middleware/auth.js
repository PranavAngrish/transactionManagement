const {users} = require('../db/store');
const bcrypt = require('bcrypt');

async function authenticate(req, res, next){
    const header = req.headers.authorization;

    if(!header || !header.startsWith("Basic ")){
        return res.status(401).json({error : "Missing authentication header"});
    }

    const base64 = header.split(" ")[1];
    const decoded = Buffer.from(base64, "base64").toString("utf8");

    const [username, password] = decoded.split(":");
    const user = users.get(username);

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    req.user = { username };
    next();

}

module.exports = { authenticate };