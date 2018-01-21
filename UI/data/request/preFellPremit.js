const dataManager = require('../../util/dataManager');
const request = require('request');
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
     * operationId: 
     */
    post: {
        200: function (req, res, callback) {
            const data = res.body;
            const pubKey = dataManager.get(data.aadhar).pubKey;

            data.pubKey = pubKey;

            request({
                url: "http://52.230.0.47/fellRequest",
                method: "POST",
                json: data
            }, (err, resp, data) => {
                console.log(data)
            })

        }
    },
    get: {
        200: function (req, res, callback) {
            res.file('public/log.html')
        }
    }
};
