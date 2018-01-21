// var http = require('http');
// console.log('helllo');
// http.createServer(function (request, response) {
//     // Send the HTTP header 
//     // HTTP Status: 200 : OK
//     // Content Type: text/plain
//     response.writeHead(200, {'Content-Type': 'text/plain'});
//     // response.send("index.html")
//     // Send the response body as "Hello World"
//     response.end('Hello World\n');
//  }).listen(8081);
 
//  // Console will print the message
//  console.log('Server running at http://127.0.0.1:8081/');

var express = require('express');
var app = express();

app.use(express.static('public'));
app.get('/index.html', function (req, res) {
   res.sendFile( __dirname + "./" + "/index.html" );
})


var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)

})