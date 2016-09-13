var bcrypt = require('bcrypt-nodejs');

var hash_password = function(plaintext) {
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(plaintext, salt);
    //console.log('hash: ' + hash);
    return hash;
};

var check_password = function(plaintext, our_hash) {
    //console.log("test: ", plaintext, our_hash);

    var kosher = bcrypt.compareSync(plaintext, our_hash);
    //console.log('password match? ' + kosher);
    return kosher;
};

module.exports = {
    hash_password: hash_password,
    check_password: check_password
};