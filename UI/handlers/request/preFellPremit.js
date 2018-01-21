'use strict';
var dataProvider = require('../../data/request/preFellPremit.js');
/**
 * Operations on /request/preFellPremit
 */
module.exports = {
    /**
     * summary: This endpoint puts in the request to create permit to cut tree
     * description: 
     * parameters: owner
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
            reply(data && data.responses).code(status);
        });
    }
};
