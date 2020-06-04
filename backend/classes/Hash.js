let randomString = require('randomstring');
let crypto = require('crypto');

class Hash {
    static generateRandomString(length) {
        return randomString.generate(length);
    }

    static createHash(string) {
        return crypto.createHash("sha256").update(string).digest("hex");
    }
}

module.exports = Hash;