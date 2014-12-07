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
		startTime = -1,
		men = {},
		keysDown = {},
		selfId;
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
		for(i in data.man) men[data.man[i].id] = {};
		selfId = socket.socket.sessionid;

		addEventListener("keydown",function (e) {
    		keysDown[e.keyCode]=true;
		}, false);

		addEventListener("keyup",function (e) {
    		delete keysDown[e.keyCode];
		}, false);

		var iii = setInterval(function(){
			var tt = (new Date()).getTime();
			if(startTime == -1)
				startTime = tt;
			if((tt-startTime)<40*tCount)
				return;
			tCount++;

			if (38 in keysDown){
				men[selfId].move = "up";
			}	//up
    		else if (40 in keysDown){
				men[selfId].move = "down";
			}	//down
    		else if (37 in keysDown){
				men[selfId].move = "left";
			}	//left
    		else if (39 in keysDown){
				men[selfId].move = "right";
			}	//right
			if(32 in keysDown){
				men[selfId].move = "bomb";
			}	//bomb - space
			cGame.execute({
				actual : [{
					man : men,
					enemy : []
				}],
				print : true
			});
			men[selfId] = {};
		},5);
	});
})