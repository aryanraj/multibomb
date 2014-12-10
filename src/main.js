requirejs.config({
	baseUrl : '/',
	waitSeconds : 30,
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
		man = {},
		enemy = {},
		keysDown = {},
		selfId,
		lastEmit = JSON.stringify({});
	
	socket.emit("done");
	socket.on("initialData", function(data){
		console.log("got data");
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
		for(i in data.man) man[data.man[i].id] = {};
		for(i in data.enemy) enemy[data.enemy[i].id] = {};
		selfId = socket.socket.sessionid;

	});
	socket.on('start',function(){
		var iii = setInterval(function(){
			var tt = (new Date()).getTime();
			if(startTime == -1)
				startTime = tt;
			if((tt-startTime)<30*tCount)
				return;
			if((tt-startTime)>30*(tCount+1)) {
				clearInterval(iii);
				alert("You missed some count. Kindly do not leave this tab in background. You can keep it in a new window active.")
				location.reload();
			}
			tCount++;

			if (38 in keysDown)	man[selfId].move = "up"; //up
    		else if (40 in keysDown) man[selfId].move = "down";	//down
    		else if (37 in keysDown) man[selfId].move = "left";	//left
    		else if (39 in keysDown) man[selfId].move = "right"; //right
			if(32 in keysDown) man[selfId].move = "bomb"; //bomb - space
			cGame.execute({
				actual : [{
					man : man,
					enemy : enemy
				}],
				print : true
			});

			if(lastEmit != JSON.stringify(man[selfId]))
				socket.emit("selfData",(function(c){
					lastEmit = JSON.stringify(c);
					c.time = tCount;
					return c;
				})(man[selfId]));

			if(man[selfId].win) {
				clearInterval(iii);
				alert("you win :D");
				location.reload();
			}
			if(!cGame.getMan("actual",selfId).alive && typeof cGame.getMan("actual",selfId).deathCountdown == "undefined") {
				clearInterval(iii);
				alert("you lose :(");
				location.reload();
			}
			man[selfId] = {};
		},5);
	});
	socket.on('data', function(data){
		console.log(data);
		for(var i in data)
			for(var j in data[i])
				man[j] = data[i][j]; 
	})

	socket.on('HTMLmessage', function(data){
		for(var i in data) document.getElementById(i).innerHTML = data[i];
	})

	addEventListener("keydown",function (e) {
		keysDown[e.keyCode]=true;
	}, false);

	addEventListener("keyup",function (e) {
		delete keysDown[e.keyCode];
	}, false);
})