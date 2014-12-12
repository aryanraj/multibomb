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
		underscore : "underscore/underscore",
		interproc : "intervalProcess"
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

require(['game','bomberMan','enemy','imageHandler','underscore','interproc','socketio'], function (g,b,e,i,_,interproc) {
	var socket = io.connect(),
		cGame,
		tCount = 0,
		startTime = -1,
		man = {},
		enemy = {},
		keysDown = {},
		selfId, intervalObject,
		serverData = [],
		lastEmit = JSON.stringify({}),
		gameInitialData, images;
	
	socket.emit('getImages');

	socket.on('images', function(data){
		images = new i.handler(data, function(){
			socket.emit("done");
		});
	});

	socket.on("initialData", function(data){
		
		console.log("got data");
		
		gameInitialData = JSON.parse(JSON.stringify(data));

		cGame = new g.handler(images);
		cGame.create({
			b : new b.handler(data.man),
			e : new e.handler(data.enemy),
			t : JSON.parse(JSON.stringify(data.token)),
			id : "actual",
			printable : true
		});
		for(i in data.man) man[data.man[i].id] = {};
		for(i in data.enemy) enemy[data.enemy[i].id] = {};
		selfId = socket.socket.sessionid;

		interproc.create({
			name : "server",
			repeat : true,
			config : {
				iterativeData : serverData,
				initialization : function(){
					cGame.create({
						b : new b.handler(gameInitialData.man),
						e : new e.handler(gameInitialData.enemy),
						t : JSON.parse(JSON.stringify(gameInitialData.token)),
						id : "server",
						printable : false
					});
					this.data.man = {};
					this.data.enemy = {};
					this.data.count = 0;
					for(i in gameInitialData.man) this.data.man[gameInitialData.man[i].id] = {};
					for(i in gameInitialData.enemy) this.data.enemy[gameInitialData.enemy[i].id] = {};
				},
				exec : function(data) {
					this.data.tCount++;
					if(this.data.tCount > tCount)
						return;
					for(var i in data)
						this.data.man[i] = data[i];
					cGame.execute({
						server : [{
							man : this.data.man,
							enemy : this.data.enemy
						}],
						print : false
					});
				},
				end : function() {
					cGame.dataOverride("actual",cGame.snapshot("server"));
				}
			}
		});
	});

	socket.on('start',function(){
		console.log('game started');
		intervalObject = setInterval(function(){
			var tt = (new Date()).getTime();
			if(startTime == -1)
				startTime = tt;
			if((tt-startTime)<30*tCount)
				return;
			if((tt-startTime)>30*(tCount+1)) {
				clearInterval(intervalObject);
				alert("You missed some count. Kindly do not leave this tab in background. You can keep it in a new window active.");
				console.log(JSON.stringify(serverData));
				// window.location=window.location.origin;
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

			if(typeof serverData[tCount-1] == "undefined")
				serverData.push({});
			
			if(lastEmit != JSON.stringify(man[selfId])) {
				lastEmit = JSON.stringify(man[selfId]);
				socket.emit("selfData",{
					time : tCount-1,
					data : man[selfId]
				})
				serverData[tCount-1][selfId] = JSON.parse(JSON.stringify(man[selfId]));
			}

			if(man[selfId].win) {
				document.getElementById('message').innerHTML = "you win :D";
			}
			if(!cGame.getMan("actual",selfId).alive && typeof cGame.getMan("actual",selfId).deathCountdown == "undefined") {
				document.getElementById('message').innerHTML = "you lose :(";
			}
			man[selfId] = {};

			interproc.execute(startTime+tCount*30-2, "server");

		},5);
	});

	socket.on('data', function(data){
		man[data.id] = data.data;
		while(typeof serverData[data.time] == "undefined")
			serverData.push({});
		serverData[data.time][data.id] = JSON.parse(JSON.stringify(data.data));
	});

	socket.on('HTMLmessage', function(data){
		for(var i in data) {
			if(~['message','form'].indexOf(i))
				document.getElementById(i).innerHTML = data[i];
			if(~['alert'].indexOf(i))
				alert(data[i]);
			if(~['redirect'].indexOf(i))
				window.location = window.location[data[i]];
			if(~['log','info','warn','debug','error'].indexOf(i))
				console[i](data[i]);
		}
	})

	addEventListener("keydown",function (e) {
		keysDown[e.keyCode]=true;
	}, false);

	addEventListener("keyup",function (e) {
		delete keysDown[e.keyCode];
	}, false);
})