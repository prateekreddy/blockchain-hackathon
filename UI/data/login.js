const dataManager = require('../util/dataManager');
const request = require('request');
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
     * operationId: 
     */
    post: {
        200: function (req, res, callback) {
            console.log(req.data);
            const aadhar = req.data.aadhar;
            
            const data = dataManager.get(aadhar);

            if(data) {
                res.send(true);
            } else {
                request.post('http://52.230.0.47/getAddress', (err, resp, body) => {
                    if(err) {
                        res.send(false);
                    } else {
                        dataManager.set(aadhar, body.data);
                        res.send(true);
                    }
                });
            }
        }
    },
    /**
     * summary: login page
     * description: login page
     * parameters: 
     * produces: 
     * responses: 200
     * operationId: 
     */
    get: {
        200: function (req, res, callback) {
            // console.log(req, res)
            res.send('public/login.html');
        }
    }
};
