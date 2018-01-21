'use strict';
var dataProvider = require('../data/register.js');
/**
 * Operations on /register
 */
module.exports = {
    /**
     * summary: This endpoint registers
     * description: This endpoint registers

     * parameters: username, password, name, email, phone
     * produces: 
     * responses: 200
     */
    post: function (req, reply, next) {
        /**
         * Get the data for response 200
         * For response `default` status 200 is used.
         */
        var status = 200;
        var provider = dataProvider['post']['200'];
        provider(req, reply, function (err, data) {
            if (err) {
                next(err);
                return;
            }
            reply(data).code(status);
        });
    },
    /**
     * summary: register page
     * description: register page
     * parameters: 
     * produces: 
     * responses: 200
     */
    get: function (req, reply, next) {
        /**
         * Get the data for response 200
         * For response `default` status 200 is used.
         */
        var status = 200;
        var provider = dataProvider['get']['200'];
        provider(req, reply, function (err, data) {
            if (err) {
                next(err);
                return;
            }
            reply(data && data.responses).code(status);
        });
    }
};
