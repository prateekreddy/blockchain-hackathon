var request = require("request");
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require("body-parser");
const uuidv1 = require('uuid/v1');

var survey = require('./db/census.json')

const getNewItems = (s1, s2, callback) => {
    loadrequests(s1, (s1results) => {
	loadrequests(s2, (s2results) => {
	console.log(s1results, s2results)	
		const oldResultPointer = s2results.result.length;
// assuming s1 is biger than s2
		callback(s1results.result.splice(oldResultPointer))
	})
	});
}

const poll = () => {
    getNewItems("foreststream", "surveystream", (data) => {
        console.log("checking new tx",data.length);
        for(let i =0; i < data.length; i++) {
            getKeyItem("foreststream", data[i].key, (keyItem) => {
                const userData = JSON.parse(keyItem.result[keyItem.result.length-1].data.hexDecode())
                const requestId = keyItem.result[keyItem.result.length-1].key;
                let dataToSend = {
                    ownername: userData.ownername,
                    survey_no: userData.survey_no,
                    pubkey: userData.pubkey,
                    status:"false" 
                }
                if(survey[dataToSend.survey_no] === undefined){
                    dataToSend.location = "nil"
                    sendToStream(requestId, dataToSend, "surveystream");
                }else{
                    if(dataToSend.ownername == survey[dataToSend.survey_no].owner){
                        dataToSend.status = "true"
                        dataToSend.location = survey[dataToSend.survey_no].location
                    }else{
                        dataToSend.status = "false"
                        dataToSend.location = "nil"
                    }
                    sendToStream(requestId, dataToSend, "surveystream");
                }

            });      
        }
    })
}

poll();
setInterval(poll, 10000);

// getKeyItem("streamName","key")
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/hello', function (req, res) {
  res.send('hello')
});



io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

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
    { method: 'publish',
        params: [ 'surveystream', requestId,hex ],
        id: 1,
        chain_name: 'tree' },
    json: true };

    request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
    });
}


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
       { 'postman-token': '68d02024-6424-a0e1-f475-8f330d717888',
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

server.listen(80);

