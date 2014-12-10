"use strict";
var express=require('express.io'),
	app=express().http().io(),
	createGame = require(__dirname+'/src/create_game.js'),
	cnf = require(__dirname+'/config/levels'),
	games = {};

app.use(express.static(__dirname+'/src'));
app.use(express.static(__dirname+'/public'));
app.use(express.static(__dirname+'/bower_components'));
app.use(express.cookieParser());
app.use(express.session({secret : 'G0t_sOm3_boMb5_1n_h4nd'}))

app.io.route('done', function(req) {
	var sess = typeof req.session.game != "undefined" ? req.session.game : req.session.game = req.socket.id;
	req.io.join(sess);
	typeof games[sess] == "undefined" ? games[sess] = 1 : games[sess]++;
	if(sess == req.socket.id){
		req.socket.emit('HTMLmessage',
			{ form :'<p>Give this <a href="/join/'+sess+'">link</a> to your friends</p>\
			<input name="start" value="yes" style="display:none;"><button>Click if enough people have joined (max 4)</button>'});
		req.socket.on('form', function(data){
			var level1 = createGame(cnf['1'],app.io.rooms['/'+sess]);
				level1.images = cnf["images"];
				app.io.room(sess).broadcast("initialData",level1);
			if(JSON.stringify(data) == "\"start=yes\"")
				setTimeout(function(){
					app.io.room(sess).broadcast('start');
				}, 5000);
		});
	}
	console.log(sess,app.io.rooms['/'+sess]);
	app.io.room(sess).broadcast('HTMLmessage',{message:'Total players connected = '+games[sess]});
});

app.io.route('selfData', function(req) {
	var data = {};
		data[req.data.time] = {};
		data[req.data.time][req.socket.id] = (function(a){
			delete a.time;
			return a;
		})(req.data);
	req.io.room(req.session.game).broadcast('data',data);
});

app.io.route('disconnect', function(req){
	console.log("destroying",req.socket.id);
	req.session.destroy();
})

app.get('/', function(req,res) {
	res.sendfile(__dirname+'/client.html');
});

app.get('/join/:game', function(req,res){
	if(req.params.game in games) {
		if(typeof games[req.params.game] == "number"){
			res.sendfile(__dirname+'/client.html');
			req.session.game = req.params.game;
		} else {
			res.send('Oh so sad, you did not get a chance to join the game ' + req.params.game + ' :(');
		}
	}
	else
		res.send('<script>alert("game not available!! You could create new game."); window.location=window.location.origin;</script>');
});

app.listen(process.env.PORT || 8080);