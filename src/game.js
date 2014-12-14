"use strict";
(function(global,factory){
	if(typeof define==="function" && define.amd)
		define(['exports'], factory) //AMD
	else factory(global);
})(typeof window === "object" ? window.Game = {} : module.exports = {},
function(game){
	var object = function(b,e,t) {
		this.man = b;
		this.enemy = e;
		this.token = t;
		this.timeStamp = [];
		this.center = {
			blast : [],
			dooropen : []
		};
	};

	object.prototype.blastBomb = function(x,y) {
		var blastElement = [];
		blastElement[-3] = 
		blastElement[ 0] = true;
		x = parseInt(x);
		y = parseInt(y);

		this.token.backgrndArray[y][x] = -30;

		if(this.token.backgrndArray[y-1][x] in blastElement)
			this.token.backgrndArray[y-1][x] = -20;
		else if(this.token.backgrndArray[y-1][x] == -4)
			this.token.backgrndArray[y-1][x] = -40;

		if(this.token.backgrndArray[y+1][x] in blastElement)
			this.token.backgrndArray[y+1][x] = -20;
		else if(this.token.backgrndArray[y+1][x] == -4)
			this.token.backgrndArray[y+1][x] = -40;

		if(this.token.backgrndArray[y][x-1] in blastElement)
			this.token.backgrndArray[y][x-1] = -20;
		else if(this.token.backgrndArray[y][x-1] == -4)
			this.token.backgrndArray[y][x-1] = -40;

		if(this.token.backgrndArray[y][x+1] in blastElement)
			this.token.backgrndArray[y][x+1] = -20;
		else if(this.token.backgrndArray[y][x+1] == -4)
			this.token.backgrndArray[y][x+1] = -40;
	};

	object.prototype.background = function() {
		if(this.token.printList)
			this.token.printList.push({
				type : 'bk',
				x : 0,
				y : 0,
				z : 0
			});
		this.center.blast.length = 0;
		this.center.dooropen.length = 0;
		var i,j;
		for(i in this.token.backgrndArray)
			for(j in this.token.backgrndArray[i]) {
				if([-3,-4].indexOf(this.token.backgrndArray[i][j]) != -1)
					if(this.token.printList)
						this.token.printList.push({
							type : 'box',
							x : j*32,
							y : i*32,
							z : 10
						});
				if([-5].indexOf(this.token.backgrndArray[i][j]) != -1) {
					if(this.enemy.aliveCount == 0)
						this.token.backgrndArray[i][j] = -6;
					else
					if(this.token.printList)
						this.token.printList.push({
							type : 'doorclose',
							x : j*32,
							y : i*32,
							z : 10
						});
				}
				if([-6].indexOf(this.token.backgrndArray[i][j]) != -1) {
					if(this.token.printList)
						this.token.printList.push({
							type : 'dooropen',
							x : j*32,
							y : i*32,
							z : 10
						});
					this.center.dooropen.push({
						x : j*32+16,
						y : i*32+16
					});
				}
				if(this.token.backgrndArray[i][j] > 10){
					this.token.backgrndArray[i][j]--;
					if(this.token.backgrndArray[i][j] == 10)
						this.blastBomb(j,i);
					else
					if(this.token.printList)
						this.token.printList.push({
							type : 'bomb',
							x : j*32,
							y : i*32,
							z : 10,
							imageNo : parseInt(this.token.backgrndArray[i][j]/10)%2
						});
				}
				if(this.token.backgrndArray[i][j]<-10){
					this.center.blast.push({
						x : j*32+16,
						y : i*32+16
					});
					if(this.token.printList && this.token.backgrndArray[i][j] > -31 && this.token.backgrndArray[i][j] < -20)
						this.token.printList.push({
							type : 'blast',
							x : j*32,
							y : i*32,
							z : 10,
							imageNo : parseInt((30+this.token.backgrndArray[i][j])/3)
						});
					this.token.backgrndArray[i][j]++;
					if(this.token.backgrndArray[i][j] == -11 || this.token.backgrndArray[i][j] == -21)
						this.token.backgrndArray[i][j] = 0;
					if(this.token.backgrndArray[i][j] == -31)
						this.token.backgrndArray[i][j] = -5;
                }
			}
	};

	object.prototype.checkDeath = function(data) {
		var dist = function(a,b) {
			return Math.sqrt(Math.pow(a.x-b.x,2)+Math.pow(a.y-b.y,2));
		}
		var i,j;
		for(i in this.center.enemy){
			for(j in this.center.blast){
				if(dist(this.center.enemy[i],this.center.blast[j])<32) {
					data.enemy[i].alive=false;
					delete this.center.enemy[i];
					break;
				}
			}
		}
		for(i in this.center.man){
			for(j in this.center.enemy){
				if(dist(this.center.man[i],this.center.enemy[j])<32) {
					data.man[i].alive=false;
					break;
				}
			}
			for(j in this.center.blast){
				if(dist(this.center.man[i],this.center.blast[j])<32) {
					data.man[i].alive=false;
					break;
				}
			}
			for(j in this.center.dooropen){
				if(dist(this.center.man[i],this.center.dooropen[j])<32) {
					data.man[i].win = true;
					break;
				}
			}
		}
		// console.log(JSON.stringify(data));
	};

	object.prototype.execute = function(data) {
		if(!("push" in data))
			data = [data];
		var i;
		for(i in data) {
			var time = (new Date()).getTime();
			if(typeof this.startTime === "undefined")
				this.startTime = time;

			this.background();

			this.center.man = this.man.getCenter();
			this.center.enemy = this.enemy.getCenter();

			this.checkDeath(data[i]);

			this.man.move(data[i].man, this.token);
			this.enemy.move(data[i].enemy, this.token);

			// console.log(JSON.stringify(data[i]));
			this.timeStamp.push(data[i]);
		}
	};

	game.list = {};
	game.count = 0;
	game.printList = [];
	game.addImage = function(images) {
		game.image = images;
		game.image.onDocumentLoad();
	}
	game.create = function(objs) {
		if(!("push" in objs))
			objs = [objs];
		var i;
		for(i in objs) {
			if(objs[i].printable)
				objs[i].t.printList = game.printList;
			game.list[objs[i].id] = new object(objs[i].b,objs[i].e,objs[i].t);
			game.count++;
		}
	}
	game.execute = function(data) {
		var i;
		game.printList.length = 0;
		for(i in game.list)	if(i in data) game.list[i].execute(data[i]);
		if(game.image && data.print)
			game.image.render(game.printList);
		// console.log(game.printList);
	}
	game.getMan = function(gameid,manid) {
		return game.list[gameid].man.list[manid];
	}
	game.snapshot = function(id) {
		return {
			man : game.list[id].man.snapshot(),
			enemy : game.list[id].enemy.snapshot(),
			token : {
				backgrndArray : JSON.parse(JSON.stringify(game.list[id].token.backgrndArray))
			}
		};
	}
	game.dataOverride = function(id, data) {
		game.list[id].man.dataOverride(data.man);
		game.list[id].enemy.dataOverride(data.enemy);
		game.list[id].token.backgrndArray = data.token.backgrndArray;
	}
	game.getTimestamp = function(id,start,end) {
		return JSON.parse(JSON.stringify(game.list[id].timeStamp)).slice(start,end);
	}

})