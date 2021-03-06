
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

var messages_arr = ['Computer: Hello, world!'];

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

app.get('/users', user.list);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket) {
	socket.on('set username', function(data) {
		socket.set('username', data['username'], function() {
			console.log('Username set to ' + data['username']);
		});
	});
	socket.emit('messages', {messages: messages_arr });
	socket.on('message', function (data) {
		socket.get('username', function (err, username) {
			console.log(username);
			var message = username + ': ' + data['message'];
			console.log(message);
			messages_arr.push(message);
			socket.emit('new message', {message: message});
			socket.broadcast.emit('new message', {message: message});
		});
	});
});
