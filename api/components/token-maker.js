var jwt = require('jwt-simple');

var secret = "{2d180d2f-07a2-4da4-8132-86ccd9ec3c41}";

var tokenmaker = {
    encode:function(value){
        return jwt.encode(value, secret);
    },
    decode:function(encodedValue){
        return jwt.decode(encodedValue, secret);
    }
};

module.exports = tokenmaker;