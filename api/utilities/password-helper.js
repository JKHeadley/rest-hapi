var bcrypt = require('bcrypt-nodejs');

/**
 * Encrypt a password using bcrypt
 * @param plaintext
 * @returns {*} The encrypted password
 */
var hash_password = function(plaintext) {
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(plaintext, salt);
    return hash;
};

/**
 * Checks if a password and an encrypted password are equivalent
 * @param plaintext
 * @param our_hash
 * @returns {*} Returns true if they are equivalent, false if not.
 */
var check_password = function(plaintext, our_hash) {
    var kosher = bcrypt.compareSync(plaintext, our_hash);
    return kosher;
};

module.exports = {
    hash_password: hash_password,
    check_password: check_password
};