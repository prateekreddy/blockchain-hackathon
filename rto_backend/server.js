var request = require("request");
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require("body-parser");
const uuidv1 = require('uuid/v1');

var survey = require('./db/census.json')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/check',function(req,res){
    var transportPermitId = req.body.transportPermitId;
    getKeyItem("transportstream",transportPermitId,function(keyItem){
        var transportpermitData = JSON.parse(keyItem.result[keyItem.result.length-1].data.hexDecode())
        res.send(transportpermitData)
    })
})

app.post("/allpermits",function(req,res){
    loadrequests("transportstream",function(data){
        res.send(data)
    })
})

app.post("/logreport",function(req,res){
    getKeyItem("transportstream",req.body.transportPermitId,function(keyItem){
        var transportPermit = JSON.parse(keyItem.result[keyItem.result.length-1].data.hexDecode())
        if(keyItem.result == null || keyItem.result.length == 0) {
            res.send({status:"incorrect permit Id"})
        }else{
            sendToStream(req.body.transportPermitId,req.body)
            res.send({status:"log report submitted succesfully"})
        }
    })
})

String.prototype.hexEncode = function(){
    var hex, i;

    var result = "";
    for (i=0; i<this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += ("000"+hex).slice(-4);
    }

    return result
}

String.prototype.hexDecode = function(){
    var j;
    var hexes = this.match(/.{1,4}/g) || [];
    var back = "";
    for(j = 0; j<hexes.length; j++) {
        back += String.fromCharCode(parseInt(hexes[j], 16));
    }

    return back;
}

function loadrequests(streamName, callback){

    var options = { method: 'POST',
    url: 'http://127.0.0.1:2658',
    headers: 
    { 'postman-token': '324e6c74-f951-d485-9f1b-d855188f1225',
        'cache-control': 'no-cache',
        authorization: 'Basic cmFrc2hhOnJha3NoYQ==',
        'content-type': 'application/json' },
    body: 
    { method: 'liststreamkeys',
        params: [ streamName ],
        id: 1,
        chain_name: 'tree' },
    json: true };

    request(options, function (error, response, body) {
    if (error) throw new Error(error);
//	console.log(body)
    	callback(body);
    });

}

function getKeyItem(streamName,key, callback){

    var options = { method: 'POST',
      url: 'http://127.0.0.1:2658/',
      headers: 
      { 'postman-token': '324e6c74-f951-d485-9f1b-d855188f1225',
          'cache-control': 'no-cache',
          authorization: 'Basic cmFrc2hhOnJha3NoYQ==',
          'content-type': 'application/json' },
      body: 
       { method: 'liststreamkeyitems',
         params: [ streamName, key ],
         id: 1,
         chain_name: 'tree' },
      json: true };
    
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
    
     callback(body);
    });
    
}

function sendToStream(requestId,data){
    var hex = JSON.stringify(data).hexEncode()

    var options = { method: 'POST',
    url: 'http://127.0.0.1:2658/',
    headers: 
    { 'postman-token': '47c89c8b-626e-d49f-a4e3-d3c5498900a4',
        'cache-control': 'no-cache',
        authorization: 'Basic cmFrc2hhOnJha3NoYQ==',
        'content-type': 'application/json' },
    body: 
    { method: 'publishfrom',
        params: [ "19buqKQM7PbocSDTHez2tn38Auy4U4szrG16ca",'sawmillstream', requestId,hex ],
        id: 1,
        chain_name: 'tree' },
    json: true };

    request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
    });
}

server.listen(80);
