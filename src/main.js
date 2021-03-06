requirejs.config({
	baseUrl : '/',
	waitSeconds : 0,
	paths : {
		bomberMan : "src/bomber_man",
		enemy : "src/enemy",
		imageHandler : "src/image_handler",
		game : "src/game",
		easeljs : "lib/easel",
		socketio : "socket.io/socket.io",
		underscore : "lib/underscore",
		interproc : "src/intervalProcess"
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

require(['game','bomberMan','enemy','imageHandler','underscore','interproc','socketio','easeljs'], function (cGame,b,e,i,_,interproc) {
	var socket = io.connect(),
		tCount,
		startTime,
		man,
		enemy,
		keysDown = {},
		selfId,
		intervalObject,
		serverData,
		lastEmit,
		gameInitialData,
		images;

	socket.emit('getImages');

	socket.on('images', function(data){
		images = new i.handler(data, function(){
			socket.emit("done");
			document.getElementById('game-div').appendChild(images.canvas);
			setOverlay("Ask room admin to start the game");
		});
		cGame.addImage(images);
	});

	socket.on("initialData", function(data){

		console.log("got data");
		if(typeof intervalObject != "undefined")
			clearInterval(intervalObject);

		tCount = 0;
		startTime = -1;
		man = {};
		enemy = {};
		serverData = [];
		lastEmit = JSON.stringify({});

		gameInitialData = JSON.parse(JSON.stringify(data));

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
					var tman = JSON.parse(JSON.stringify(this.data.man));
					for(var i in this.data.man) {
						this.data.man[i] = {};
						if(i in data) {
							if("move" in data[i])
								this.data.man[i].move = data[i].move;
						} else {
							if("move" in tman[i])
								this.data.man[i].move = tman[i].move;
						}
					}
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
		setButton('RESTART');
		hideOverlay();
		console.log('game started');
		intervalObject = setInterval(function(){
			var tt = (new Date()).getTime();
			if(startTime == -1)
				startTime = tt;
			if((tt-startTime)<30*tCount)
				return;
			if((tt-startTime)>30*(tCount+1) + 10000) {
				clearInterval(intervalObject);
				swal("Game Disconnected", "You left the game unattended for very long", "error");
			} else if((tt-startTime)>30*(tCount+1) + 500) {
				swal("Dont leave the game.", "Others might win! Wait till you catch up", "warning");
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

			if(man[selfId].win && !window.finalFlag) {
				swal("You Won", "GOOD JOB!", "success");
				window.finalFlag = true;
				clearInterval(intervalObject);
			}
			if(!cGame.getMan("actual",selfId).alive && typeof cGame.getMan("actual",selfId).deathCountdown == "undefined" && !window.finalFlag) {
				window.finalFlag = true;
				swal("You Lost", "Better Luck next time", "error");
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
		console.log(data);
		for(var i in data) {
			if(~['link'].indexOf(i)) {
				var link = window.location.origin + data[i];
				var button = document.getElementById('button');
				button.className = "";
				setButton('START');
				setOverlay("Give the link for others to join the room");
				setLink(link);
				console.log(link);
			}
			if(~['start'].indexOf(i)) {
				setOverlay("New Game starts in 5 seconds");
			}
			if(~['playerCount'].indexOf(i)) {
				document.getElementById("player-count").innerHTML = data[i];
			}
			if(~['alert'].indexOf(i))
				swal(data[i]);
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
