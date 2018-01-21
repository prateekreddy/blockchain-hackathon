var request = require("request");
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require("body-parser");
const uuidv1 = require('uuid/v1');
const async = require('async');

var tree = require('./db/census.json')

console.log(tree)

let multichain = require("multichain-node")({
    port: 2658,
    host: '127.0.0.1',
    user: "multichainrpc",
    pass: "p8Buzsva4Y3WrckWqWVzvk2i21qKKTP2B5eMsbR55nj"
});

multichain.getInfo(function(err,data){
    console.log(data)
})

server.listen(80);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/hello', function (req, res) {
  res.send('hello')
});

app.post('/transportRequest',function(req,res){
    
    var requestData = req.body;
    var treefellpermit = requestData.treefellpermit;
    var sawmillname = requestData.sawmillname;
    var fromaddress = requestData.fromaddress;
    var sawmilladdress = requestData.sawmilladdress;
    var vehiclenumber = requestData.vehiclenumber;
    var quantity = requestData.quantity;

    var transportPermitId = uuidv1();

    sendtoTransportStream(transportPermitId,req.body)
    // sendtoBescomstream(transportPermitId,req.body)

    res.send({status:"true",transportPermitId:transportPermitId})
})

app.post('/fellRequest',function(req,res){
    var requestData = req.body
    var notready;
    var treenum;
    var requestId = uuidv1()
    requestData.census_no.forEach(element => {
       if(tree[element]){
        var date = new Date(tree[element].planted)
        var now = new Date()
        if(now.getTime() > date.getTime() + 630720000000){
            notready = true;
            treenum = element;
        }
       }else{
            res.send({status:"fail",requestId:requestId,info:"invalid census number "+element})
       }
    });

    if(notready){
        res.send({status:"fail",requestId:requestId,info:"tree not ready "+treenum})    
    }else{
        sendToForestStream(requestId,requestData)
        var obj = {
            census_no : requestData.census_no,
            status : "true"
        }
        sendToCutStream(requestId,obj)
        res.send({status:"pending",requestId:requestId,info:"processing approval"})
    }
    
})

app.post('/getAddress',function(req,res){
    multichain.getNewAddress(function(err,data){
        grantreceive(data)
        res.send({status:"success",data:data})
    })
})

app.post("/getlogreport",function(req,res){
    getKeyItem("sawmillstream", req.body.permitId, function(keyItem){
        if(keyItem.result == null || keyItem.result.length == 0) {
            res.send({status:"no such permit"}) 
        }else{
            res.send(JSON.parse(keyItem.result[keyItem.result.length-1].data.hexDecode()))
        }
    })
})
io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
  socket.on('requestStatus',function(data){
    
  })
});

app.post('/getallpermits',function(req,res){
    var pubkey = req.body.pubkey
    listtransactions(pubkey,function(data){
        res.send(data)
    })
})

app.post('/requestStatus',function(req,res){
    
    var permissions = {

    }

    var requestId = req.body.requestId;

    async.parallel({
        survey : function(callback){
            getKeyItem("surveystream", requestId, function(keyItem){
                if(keyItem.result == null || keyItem.result.length == 0) {
                    callback(null,{status:"fail"}) 
                }else{
                    callback(null,JSON.parse(keyItem.result[keyItem.result.length-1].data.hexDecode()))
                }
            })
        },
        revenue: function(callback){
            getKeyItem("revenuestream", requestId, function(keyItem){
                if(keyItem.result == null || keyItem.result.length == 0) {
                    callback(null,{status:"fail"}) 
                }else{
                    callback(null,JSON.parse(keyItem.result[keyItem.result.length-1].data.hexDecode()))
                }
            })
        },
        land: function(callback){
            getKeyItem("revenuestream", requestId, function(keyItem){
                if(keyItem.result == null || keyItem.result.length == 0) {
                    callback(null,{status:"fail"}) 
                }else{
                    callback(null,JSON.parse(keyItem.result[keyItem.result.length-1].data.hexDecode()))
                }
            })
        },
        forest: function(callback){
            getKeyItem("cutstream", requestId, function(keyItem){
                if(keyItem.result == null || keyItem.result.length == 0) {
                    callback(null,{status:"fail"}) 
                }else{
                    callback(null,JSON.parse(keyItem.result[keyItem.result.length-1].data.hexDecode()))
                }
            })
        },
        allpermit: function(callback){
            getKeyItem("allpermission", requestId, function(keyItem){
                if(keyItem.result == null || keyItem.result.length == 0) {
                    callback(null,{status:"fail"}) 
                }else{
                    callback(null,JSON.parse(keyItem.result[keyItem.result.length-1].data.hexDecode()))
                }
            })
        }
    },function(err,result){
        result.permitId = requestId;
        res.send(result);
    })
    
})


const getNewItems = (s1, s2, callback) => {
    loadrequests(s1, (s1results) => {
	loadrequests(s2, (s2results) => {
	// console.log(s1results, s2results)	
		const oldResultPointer = s2results.result.length;
// assuming s1 is biger than s2
		console.log(s1results.result.length, oldResultPointer)
		callback(s1results.result.splice(oldResultPointer))
	})
	});
}

const checkIfApproved = () => {
    getNewItems("foreststream", "allpermission", (data) => {
	console.log(data)
        for(let i = 0; i < data.length; i++) {
            async.parallel({
                survey: (callback) => {
                    getKeyItem("surveystream", data[i].key, (keyItem) => {
                        if(keyItem.result == null || keyItem.result.length == 0) {
                            callback(true, null);
                            console.log(keyItem.error)
			                return;
                        }
			//console.log(keyItem);
                        const userData = JSON.parse(keyItem.result[keyItem.result.length-1].data.hexDecode())
                        const requestId = keyItem.result[keyItem.result.length-1].key;
                        console.log("survey status",userData.status)
                        if(userData.status == 'true') {
                            callback(null, {pubkey:userData.pubkey,requestId:requestId, status: true});
                        } else {
                            callback(null, {pubkey:userData.pubkey,requestId:requestId, status: false});
                        }
                    });
                },
                land: (callback) => {
                    getKeyItem("landstream", data[i].key, (keyItem) => {
                        if(keyItem.result.length == 0) {
                            callback(true, null);
			                return;
                        }
            //console.log(keyItem)
    
                        const userData = JSON.parse(keyItem.result[keyItem.result.length-1].data.hexDecode())
                        const requestId = keyItem.result[keyItem.result.length-1].key;
                        console.log("land status",userData.status)
                        if(userData.status == 'true') {
                            callback(null, {pubkey:userData.pubkey,requestId:requestId, status: true});
                        } else {
                            callback(null, {pubkey:userData.pubkey,requestId:requestId, status: false});
                        }
                    });
                },
                revenue: (callback) => {
                    getKeyItem("revenuestream", data[i].key, (keyItem) => {
                        if(keyItem.result.length == 0) {
                            callback(true, null);
			                return;
                        }
                        const userData = JSON.parse(keyItem.result[keyItem.result.length-1].data.hexDecode())
                        const requestId = keyItem.result[keyItem.result.length-1].key;
                        console.log("revenue status",userData.status)
                        if(userData.status == 'true') {
                            callback(null, {pubkey:userData.pubkey,requestId:requestId, status: true});
                        } else {
                            callback(null, {pubkey:userData.pubkey,requestId:requestId, status: false});
                        }
                    });
                },
            }, (err, result) => {
                if(err) {
                    console.log('Not updated in other departments');
                }else if(result.survey.status && result.land.status && result.revenue.status) {
                    sendToAllPermission(result.survey.requestId,{status:"true"})
                    sendPermits("permit",result.survey.pubkey,data[i].key)
                }else {
                    sendToAllPermission(result.survey.requestId,{status:"false"})
                    sendPermits("reject",result.survey.pubkey,data[i].key)
                }
            });
        }
    });
};

checkIfApproved()
setInterval(checkIfApproved,10000)


function sendPermits(assetName,pubkey,reqId){
    
    var options = { method: 'POST',
    url: 'http://127.0.0.1:2658/',
    headers: 
    { 'postman-token': '47c89c8b-626e-d49f-a4e3-d3c5498900a4',
        'cache-control': 'no-cache',
        authorization: 'Basic bXVsdGljaGFpbnJwYzpwOEJ1enN2YTRZM1dyY2tXcVdWenZrMmkyMXFLS1RQMkI1ZU1zYlI1NW5q',
        'content-type': 'application/json' },
    body: 
    { method: 'sendasset',
        params: [ pubkey, assetName,1,0,reqId],
        id: 1,
        chain_name: 'tree' },
    json: true };

    request(options, function (error, response, body) {
    if (error) throw new Error(error);
    console.log("sendassets",assetName,pubkey,reqId)
    console.log(body);
    });
}
function sendToAllPermission(requestId,data){
    var hex = JSON.stringify(data).hexEncode()

    var options = { method: 'POST',
    url: 'http://127.0.0.1:2658/',
    headers: 
    { 'postman-token': '47c89c8b-626e-d49f-a4e3-d3c5498900a4',
        'cache-control': 'no-cache',
        authorization: 'Basic bXVsdGljaGFpbnJwYzpwOEJ1enN2YTRZM1dyY2tXcVdWenZrMmkyMXFLS1RQMkI1ZU1zYlI1NW5q',
        'content-type': 'application/json' },
    body: 
    { method: 'publish',
        params: [ 'allpermission', requestId,hex ],
        id: 1,
        chain_name: 'tree' },
    json: true };

    request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
    });
}

function sendtoBescomstream(requestId,data){
    var hex = JSON.stringify(data).hexEncode()

    var options = { method: 'POST',
    url: 'http://127.0.0.1:2658/',
    headers: 
    { 'postman-token': '47c89c8b-626e-d49f-a4e3-d3c5498900a4',
        'cache-control': 'no-cache',
        authorization: 'Basic bXVsdGljaGFpbnJwYzpwOEJ1enN2YTRZM1dyY2tXcVdWenZrMmkyMXFLS1RQMkI1ZU1zYlI1NW5q',
        'content-type': 'application/json' },
    body: 
    { method: 'publish',
        params: [ 'bescomstream', requestId,hex ],
        id: 1,
        chain_name: 'tree' },
    json: true };

    request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
    });
}

function sendToForestStream(requestId,data){
    var hex = JSON.stringify(data).hexEncode()

    var options = { method: 'POST',
    url: 'http://127.0.0.1:2658/',
    headers: 
    { 'postman-token': '47c89c8b-626e-d49f-a4e3-d3c5498900a4',
        'cache-control': 'no-cache',
        authorization: 'Basic bXVsdGljaGFpbnJwYzpwOEJ1enN2YTRZM1dyY2tXcVdWenZrMmkyMXFLS1RQMkI1ZU1zYlI1NW5q',
        'content-type': 'application/json' },
    body: 
    { method: 'publish',
        params: [ 'foreststream', requestId,hex ],
        id: 1,
        chain_name: 'tree' },
    json: true };

    request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
    });
}

function sendtoTransportStream(requestId,data){
    var hex = JSON.stringify(data).hexEncode()

    var options = { method: 'POST',
    url: 'http://127.0.0.1:2658/',
    headers: 
    { 'postman-token': '47c89c8b-626e-d49f-a4e3-d3c5498900a4',
        'cache-control': 'no-cache',
        authorization: 'Basic bXVsdGljaGFpbnJwYzpwOEJ1enN2YTRZM1dyY2tXcVdWenZrMmkyMXFLS1RQMkI1ZU1zYlI1NW5q',
        'content-type': 'application/json' },
    body: 
    { method: 'publish',
        params: [ 'transportstream', requestId,hex ],
        id: 1,
        chain_name: 'tree' },
    json: true };

    request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
    });
}

function sendToCutStream(requestId,data){
    var hex = JSON.stringify(data).hexEncode()

    var options = { method: 'POST',
    url: 'http://127.0.0.1:2658/',
    headers: 
    { 'postman-token': '47c89c8b-626e-d49f-a4e3-d3c5498900a4',
        'cache-control': 'no-cache',
        authorization: 'Basic bXVsdGljaGFpbnJwYzpwOEJ1enN2YTRZM1dyY2tXcVdWenZrMmkyMXFLS1RQMkI1ZU1zYlI1NW5q',
        'content-type': 'application/json' },
    body: 
    { method: 'publish',
        params: [ 'cutstream', requestId,hex ],
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

function getKeyItem(streamName,key, callback){

    var options = { method: 'POST',
    url: 'http://127.0.0.1:2658/',
    headers: 
    { 'postman-token': '47c89c8b-626e-d49f-a4e3-d3c5498900a4',
        'cache-control': 'no-cache',
        authorization: 'Basic bXVsdGljaGFpbnJwYzpwOEJ1enN2YTRZM1dyY2tXcVdWenZrMmkyMXFLS1RQMkI1ZU1zYlI1NW5q',
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

function loadrequests(streamName, callback){

    var options = { method: 'POST',
    url: 'http://127.0.0.1:2658',
    headers: 
    { 'postman-token': '324e6c74-f951-d485-9f1b-d855188f1225',
        'cache-control': 'no-cache',
        authorization: 'Basic bXVsdGljaGFpbnJwYzpwOEJ1enN2YTRZM1dyY2tXcVdWenZrMmkyMXFLS1RQMkI1ZU1zYlI1NW5q==',
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

function listtransactions(pubkey, callback){

    var options = { method: 'POST',
    url: 'http://127.0.0.1:2658',
    headers: 
    { 'postman-token': '324e6c74-f951-d485-9f1b-d855188f1225',
        'cache-control': 'no-cache',
        authorization: 'Basic bXVsdGljaGFpbnJwYzpwOEJ1enN2YTRZM1dyY2tXcVdWenZrMmkyMXFLS1RQMkI1ZU1zYlI1NW5q==',
        'content-type': 'application/json' },
    body:  
    { method: 'listaddresstransactions',
        params: [ pubkey ],
        id: 1,
        chain_name: 'tree' },
    json: true };

    request(options, function (error, response, body) {
    if (error) throw new Error(error);
//	console.log(body)
    	callback(body);
    });

}

function grantreceive(pubkey){
    var options = { method: 'POST',
    url: 'http://127.0.0.1:2658',
    headers: 
    { 'postman-token': '324e6c74-f951-d485-9f1b-d855188f1225',
        'cache-control': 'no-cache',
        authorization: 'Basic bXVsdGljaGFpbnJwYzpwOEJ1enN2YTRZM1dyY2tXcVdWenZrMmkyMXFLS1RQMkI1ZU1zYlI1NW5q==',
        'content-type': 'application/json' },
    body:  
    { method: 'grant',
        params: [ pubkey ,"receive"],
        id: 1,
        chain_name: 'tree' },
    json: true };

    request(options, function (error, response, body) {
    if (error) throw new Error(error);
    	console.log(pubkey," received permissions")
    });
}
