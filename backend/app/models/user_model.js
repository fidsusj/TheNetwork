let Database = require('../../classes/Database');

module.exports = {
    validateToken: function (token, callback, logging) {
        Database.getInstance().validateToken(token, (result) => {
            if (result !== false) {
                if (logging) console.log('Users token (user: ' + result.Name + ' ' + result.Surname + '; token: \'' + token + '\') is valid.');
                callback({status: 'success', message: 'Token is valid.', result: result});
            } else {
                if (logging) console.log('Users token (token: \'' + token + '\') is invalid.');
                callback({status: 'error', message: 'Token is invalid.', result: null});
            }
        });
    }
};
