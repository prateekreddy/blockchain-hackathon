var request = require("request");
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require("body-parser");
const dataManager = require('./util/dataManager');
// const async = require('async');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/login', function (req, res) {
    const aadhar = req.body.aadhar;
    
    const data = dataManager.get(aadhar);

    if(data) {
        res.send(true);
    } else {
        request.post('http://52.230.0.47/getAddress', (err, resp, body) => {
            if(err) {
                res.send(false);
            } else {
                // console.log(body, body.data);
                const data = JSON.parse(body);
                dataManager.set(aadhar, data.data);
                console.log(dataManager.get(aadhar))
                res.send(true);
            }
        });
    }
});

app.post('/request/preFellPermit', (req, res) => {
    const data = req.body;
    
    const pubKey = dataManager.get(data.aadhar);

    data.pubkey = pubKey;
    data.ownername = data.owner;
    console.log(data);

    request({
        url: "http://52.230.0.47/fellRequest",
        method: "POST",
        json: data
    }, (err, resp, data) => {
        res.send(data)
    })
});

app.post('/transportRequest', (req, res) => {
    const data = req.body;
    
    request({
        url: "http://tree.southeastasia.cloudapp.azure.com/transportRequest",
        method: "POST",
        json: data
    }, (err, resp, data) => {
        res.send(data)
    })
})

app.post('/request/getAllPermits', (req, res) => {
    const aadhar = req.body.aadhar;
    const pubKey = dataManager.get(aadhar);
    console.log(aadhar, pubKey);
    // const pubKey = "1JusvszREU7kYeXTs1wSVrkbTxNGTQtAENrnQA"
    request({
        url: "http://tree.southeastasia.cloudapp.azure.com/getallpermits",
        method: "POST",
        json: {
            pubkey: pubKey
        }
    }, (err, resp, data) => {
        console.log(err, data);
        const permitRefs = [];
        const txList = data.result;
        // console.log(txList)

        for(let i =0; i < txList.length; i++) {
            if(txList[i].comment) {
                permitRefs.push(txList[i].comment);
            }
        }

        const noOfPermits = permitRefs.length;
        let permitList = [];
        
        for(let j =0; j < noOfPermits; j++ ) {
            request({
                url: "http://tree.southeastasia.cloudapp.azure.com/requestStatus",
                method: "POST",
                json: {
                    requestId: permitRefs[j]
                }
            }, (err, resp, data) => {
                const permitData = {
                    owner: data.survey.ownername,
                    survey_no: data.survey.survey_no,
                    location: data.survey.location,
                    khata_no: data.revenue.khata_no,
                    census_no: data.forest.census_no,
                    permitId: data.permitId,
                    survey_status: data.survey.status,
                    revenue_status: data.revenue.status,
                    land_status: data.land.status,
                    allPermit_status: data.allpermit.status
                }
                permitList.push(permitData);
                if(permitList.length == noOfPermits) {
                    res.send(permitList);
                }
            });
        }
    })
});

app.use(express.static('public'));
server.listen(8080);