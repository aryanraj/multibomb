"use strict";
var express=require('express.io'),
	app=express().http().io(),
	createGame = require(__dirname+'/src/create_game.js'),
	cnf = require(__dirname+'/config/levels'),
	games = {};

app.use(express.static(__dirname+'/public'));
app.use(express.cookieParser());
app.use(express.session({secret : 'G0t_sOm3_boMb5_1n_h4nd'}))

app.io.route('done', function(req) {
	if(typeof req.session.game == "undefined") {
		req.session.game = req.socket.id;
		games[req.session.game] = "join";
	} else if(app.io.rooms['/'+req.session.game].length == 4) {
		delete req.session.game;
		req.socket.emit('HTMLmessage',{
			alert : 'Maximum Player limit reached. Create another game if you want.',
			redirect : 'origin'
		});
		return;
	}
	req.io.join(req.session.game);
	if(req.session.game == req.socket.id){
		req.socket.emit('HTMLmessage',
			{ form :'<p>Give this <a href="/join/'+req.session.game+'">link</a> to your friends</p>\
			<input name="start" value="yes" style="display:none;"><button>Click if enough people have joined (max 4)</button>'});
		req.socket.on('form', function(data){
			if(JSON.stringify(data) == "\"start=yes\"") {
				app.io.room(req.session.game).broadcast("initialData",createGame(cnf['1'],app.io.rooms['/'+req.session.game]));
				games[req.session.game] = {};
				app.io.room(req.session.game).broadcast('HTMLmessage',{message:'The game is about to start.<br /> Get ready!'});
				setTimeout(function(){
					app.io.room(req.session.game).broadcast('start');
				}, 5000);
			}
		});
	}
	console.log(req.session.game,app.io.rooms['/'+req.session.game]);
	app.io.room(req.session.game).broadcast('HTMLmessage',{message:'Total players connected = '+app.io.rooms['/'+req.session.game].length});
});

app.io.route('selfData', function(req) {
	if(typeof games[req.session.game][req.data.time] == "undefined")
		games[req.session.game][req.data.time] = {};

	games[req.session.game][req.data.time][req.socket.id] = req.data.data;

	req.io.room(req.session.game).broadcast('data',{
		id : req.socket.id,
		time : req.data.time,
		data : req.data.data
	});
});

app.io.route('getImages', function(req){
	req.socket.emit('images',cnf['images']);
});

app.io.route('disconnect', function(req){
	// console.log("destroying",req.socket.id);
	// console.log(app.io.rooms['/'+req.session.game].length,app.io.rooms);
	if(typeof req.session.game !== "undefined") {
		if(games[req.session.game] == "join")
			app.io.room(req.session.game).broadcast('HTMLmessage',{message:'Total players connected = '+(app.io.rooms['/'+req.session.game].length-1)});
	}
	req.session.destroy();
})

app.get('/', function(req,res) {
	// console.log("GET /",req.session);
	if(typeof req.session.game !== "undefined") {
		delete req.session.game;
	}
	res.sendfile(__dirname+'/client.html');
});

app.get('/join/:game', function(req,res){
	if('/'+req.params.game in app.io.rooms) {
		if(games[req.params.game] == "join"){
			res.sendfile(__dirname+'/client.html');
			req.session.game = req.params.game;
		} else {
			res.send('<script>alert("Oh so sad, you did not get a chance to join the game room :("); window.location=window.location.origin;</script>');
		}
	}
	else
		res.send('<script>alert("game not available!! You could create new game."); window.location=window.location.origin;</script>');
});

app.listen(process.env.PORT || 8080);