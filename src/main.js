requirejs.config({
	baseUrl : '',
	paths : {
		bomberMan : "bomber_man",
		enemy : "enemy",
		imageHandler : "image_handler",
		game : "game",
		easeljs : "easeljs/lib/easeljs-0.7.1.combined",
		socketio : "socket.io/socket.io",
		underscore : "underscore/underscore"
	},
	shim : {
		game : {
			deps : [
			'enemy',
			'bomberMan',
			'imageHandler',
			'underscore'
			]
		},
		imageHandler : {
			deps : [
			'easeljs',
			'underscore'
			]
		},
		easeljs : {
			exports : 'createjs'
		},
		socketio : {
			exports : 'io'
		},
		underscore : {
			exports : '_'
		}
	}
});

require(['game','bomberMan','enemy','imageHandler','underscore','socketio'], function (g,b,e,i,_) {
	var socket = io.connect(),
		cGame,
		tCount = 0,
		startTime = -1;
	socket.emit("done");
	socket.on("data", function(data){
		cGame = new g.handler(new i.handler(data.images));
		cGame.create({
			b : new b.handler(data.man),
			e : new e.handler(data.enemy),
			t : JSON.parse(JSON.stringify(data.token)),
			id : "actual",
			printable : true
		});
		cGame.create({
			b : new b.handler(data.man),
			e : new e.handler(data.enemy),
			t : JSON.parse(JSON.stringify(data.token)),
			id : "server"
		});
		console.log(cGame);
		setInterval(function(){
			var tt = (new Date()).getTime();
			if(startTime == -1)
				startTime = tt;
			if((tt-startTime)<40*tCount)
				return;
			tCount++;
			cGame.execute({
				actual : {
					man : [],
					enemy : []
				},
				print : true
			});
		},5);
	});
})