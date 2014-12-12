"use strict";
(function(global, factory){
	if(typeof define==="function" && define.amd)
		define(['exports'], factory) //AMD
	else factory(global);
})(typeof window === "object" ? window.Enemy = {} : module.exports = {},
function(enemy){
	var object = function(x,y,d){
		this.xcord = x;
		this.ycord = y;
		this.xtemp = x;
		this.ytemp = y;
		this.direct = d;
		this.alive = true;
		this.prevMove = 0;
		this.imageIndex = 0;
	};

	object.prototype.printEnemy = function(){
		var result = {
				type : "enemy",
				x : this.xcord,
				y : this.ycord,
				z : 20,
				imageNo : parseInt(this.imageIndex)%4
			}
		this.imageIndex+=0.3;
		return result;
	};

	object.prototype.move = function(token)	{
			var allowedPath = [0,-5,-6];
		switch(this.direct){
			case 'left':
				if(allowedPath.indexOf(token.backgrndArray[parseInt(this.ycord/32)][parseInt(this.xcord/32-0.001)]) != -1)
					this.xcord -=token.enemySpeed;
				break;
			case 'right':
				if(allowedPath.indexOf(token.backgrndArray[parseInt(this.ycord/32)][parseInt(this.xcord/32+1.001)]) != -1)
					this.xcord +=token.enemySpeed;
				break;
			case 'up':
				if(allowedPath.indexOf(token.backgrndArray[parseInt(this.ycord/32-0.001)][parseInt(this.xcord/32)]) != -1)
					this.ycord -=token.enemySpeed;
				break;
			case 'down':
				if(allowedPath.indexOf(token.backgrndArray[parseInt(this.ycord/32+1.001)][parseInt(this.xcord/32)]) != -1)
					this.ycord +=token.enemySpeed;
				break;
		}
		var temp = this.printEnemy();
		if(token.printList)
			token.printList.push(temp);
		this.automator();
	};

	object.prototype.automator = function() {
		if(this.xtemp == this.xcord && this.ytemp == this.ycord){
			var cha = this.xcord + this.ycord + this.prevMove;
			this.prevMove++;
			switch(this.direct){
				case 'left': cha+=1; 	break;
				case 'right': cha+=2;	break;
				case 'up': cha+=3;		break;
				case 'down': cha+=4;	break;
			}
			switch(cha%4){
				case 0: this.direct = 'left';	break;
				case 1: this.direct = 'right';	break;
				case 2: this.direct = 'up';		break;
				case 3: this.direct = 'down';	break;
			}
		}
		else	{
			this.xtemp = this.xcord;
			this.ytemp = this.ycord;
		}
	};

	object.prototype.getCenter = function() {
		return {
			x : this.xcord+16,
			y : this.ycord+16
		};
	};

	object.prototype.snapshot = function() {
		return {
			xcord : this.xcord,
			ycord : this.ycord,
			xtemp : this.xtemp,
			ytemp : this.ytemp,
			direct : this.direct,
			alive : this.alive,
			prevMove : this.prevMove,
			imageIndex : this.imageIndex
		}
	};

	object.prototype.dataOverride = function(data) {
		for(var i in data) {
			this[i] = data[i];
		}
	}

	enemy.handler = function(d){
		this.move = function(update, token) {
			var i;
			for(i in this.list) {
				var obj = this.list[i],
					upd = update[i];
				if(typeof upd == "undefined") upd = {};
				if(typeof upd.alive !== "undefined" && !upd.alive && obj.alive) {
					obj.deathCountdown=60;
					obj.alive=false;
				}
				if(typeof obj.deathCountdown !== "undefined"){
					if(typeof token.printList != "undefined")
						token.printList.push({
							type : "deadenemy",
							x : obj.xcord,
							y : obj.ycord,
							z : 20,
							imageNo : obj.deathCountdown--
						});
					if(obj.deathCountdown == 0)
						delete obj.deathCountdown;
				}
				if(obj.alive) {
					var j;
					for(j in obj) if(j in upd) obj[j] = upd[j];
					obj.move(token);
				}
			}
		};
		this.list = {};
		this.count = 0;
		this.aliveCount = 0;
		this.create = function(data) {
			if(typeof data.id !== "undefined")
				data=[data];
			var i;
			for(i in data) {
				this.list[data[i].id] = new object(data[i].x,data[i].y,data[i].d);
				this.count++; this.aliveCount++;
			}
		}
		this.getCenter = function() {
			var i,
				center = {};
			for(i in this.list) if(this.list[i].alive)
				center[i]=this.list[i].getCenter();
			this.aliveCount = Object.keys(center).length;
			return center;
		}
		this.snapshot = function() {
			var data = {};
			for(var i in this.list) {
				data[i] = this.list[i].snapshot();
			}
			return data;
		}

		this.dataOverride = function(data) {
			for(var i in data) {
				this.list[i].dataOverride(data[i]);
			}
		}

		if(typeof d !== "undefined")
			this.create(d)
	}
});