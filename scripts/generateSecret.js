const crypto = require("crypto");

const secret = crypto.randomBytes(64).toString("hex");

console.log("\nJWT_SECRET=" + secret + "\n");
