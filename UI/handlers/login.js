'use strict';
var dataProvider = require('../data/login.js');
/**
 * Operations on /login
 */
module.exports = {
    /**
     * summary: This endpoint registers the user with the application
     * description: This endpoint takes the aadhar number, shopkeeper Id , auth data, user_type and start registration and get all relavent data to verify before registration is complete 

     * parameters: username, password
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
     * summary: login page
     * description: login page
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
            reply(data).code(status);
        });
    }
};
