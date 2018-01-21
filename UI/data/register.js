const dataManager = require('../util/dataManager');
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
     * operationId: 
     */
    post: {
        200: function (req, res, callback) {
            const username = req.body.username;
            const password = req.body.password;
            const name = req.body.name;
            const email = req.body.email;
            const phone = req.body.phone;
            const aadharNo = req.body.aadharNo;

            dataManager.set(username, {
                username,
                password,
                name,
                email,
                phone,
                aadharNo
            });
        }
    },
    /**
     * summary: register page
     * description: register page
     * parameters: 
     * produces: 
     * responses: 200
     * operationId: 
     */
    get: {
        200: function (req, res, callback) {
            
        }
    }
};
