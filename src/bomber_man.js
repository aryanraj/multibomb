"use strict";
(function(global, factory){
	if(typeof define==="function" && define.amd)
		define(['exports'], factory) //AMD
	else factory(global);
})(typeof window === "object" ? window.Bomberman = {} : module.exports = {},
function(man){
	var object = function(x,y){
		this.xcord = x;
		this.ycord = y;
		this.moveOnBombAllow = false;
		this.bombAllow = 0;
		this.direct = "stand";
		this.alive = true;
		this.imageNo = 3;
		this.imageIndex = 0;
	};

	object.prototype.printMan = function(dir) {
		var result = {};
		switch(dir)	{
			case "left":
				this.imageNo = 0;
				break;
			case "right":
				this.imageNo = 6;
				break;
			case "up":
				this.imageNo = 9;
				break;
			case "down":
				this.imageNo = 3;
				break;
			default:
				this.imageIndex = 0;
		}
		if(parseInt(this.imageIndex)%2==0)
			result = {
				type : "man",
				x : this.xcord,
				y : this.ycord,
				z : 20,
				imageNo : this.imageNo
			}
		else
			result = {
				type : "man",
				x : this.xcord,
				y : this.ycord,
				z : 20,
				imageNo : this.imageNo+(parseInt(this.imageIndex)%4+1)/2
			}
		this.imageIndex+=0.3;
		return result;
	};

	object.prototype.move = function(dir, token) {
		var xfactor = (this.xcord)/32,
			yfactor = (this.ycord)/32,
			allowedPath = [0,-5,-6],
			leftmove = allowedPath.indexOf(token.backgrndArray[parseInt(yfactor)][parseInt(xfactor-0.03125*token.manSpeed)]) != -1 
						|| ( token.backgrndArray[parseInt(yfactor)][parseInt(xfactor-0.03125*token.manSpeed)] > 0
								&& this.moveOnBombAllow) ? true : false ,
			upmove = allowedPath.indexOf(token.backgrndArray[parseInt(yfactor-0.03125*token.manSpeed)][parseInt(xfactor)]) != -1 
						|| ( token.backgrndArray[parseInt(yfactor-0.03125*token.manSpeed)][parseInt(xfactor)] > 0
								&& this.moveOnBombAllow) ? true : false ,
			rightmove = allowedPath.indexOf(token.backgrndArray[parseInt(yfactor)][parseInt(xfactor+0.03125*token.manSpeed+0.9999)]) != -1
						|| ( token.backgrndArray[parseInt(yfactor)][parseInt(xfactor+0.03125*token.manSpeed+0.9999)] > 0
								&& this.moveOnBombAllow) ? true : false ,
			downmove = allowedPath.indexOf(token.backgrndArray[parseInt(yfactor+0.03125*token.manSpeed+0.9999)][parseInt(xfactor)]) != -1 
						|| ( token.backgrndArray[parseInt(yfactor+0.03125*token.manSpeed+0.9999)][parseInt(xfactor)] > 0
								&& this.moveOnBombAllow) ? true : false ,
			horimove = yfactor%2 == 1 ? true : false,
			verimove = xfactor%2 == 1 ? true : false;

		switch(dir)	{
			case "left":
				if(leftmove && horimove)	this.xcord-=token.manSpeed;
				else
					if(xfactor>1)
					if(verimove)
						if(yfactor%2>1){
							if(upmove && token.backgrndArray[parseInt(yfactor+0.9999)][parseInt(xfactor-0.9999)] == -1)
								this.ycord-=token.manSpeed;
							dir = "up";
						}
						else{
							if(downmove && token.backgrndArray[parseInt(yfactor)][parseInt(xfactor-0.9999)] == -1)
								this.ycord+=token.manSpeed;
							if(yfactor%2!=1)
								dir = "down";
						}
				break;
			case "right":
				if(rightmove && horimove)	this.xcord+=token.manSpeed;
				else
					if(xfactor<17)
					if(verimove)
						if(yfactor%2>1){
							if(upmove && token.backgrndArray[parseInt(yfactor+0.9999)][parseInt(xfactor+1)] == -1)
								this.ycord-=token.manSpeed;
							dir = "up";
						}
						else{
							if(downmove && token.backgrndArray[parseInt(yfactor)][parseInt(xfactor+1)] == -1)
								this.ycord+=token.manSpeed;
							if(yfactor%2!=1)
								dir = "down";
						}
				break;
			case "up":
				if(upmove && verimove)		this.ycord-=token.manSpeed;
				else
					if(yfactor>1)
					if(horimove)
						if(xfactor%2>1){
							if(leftmove && token.backgrndArray[parseInt(yfactor-0.9999)][parseInt(xfactor+0.9999)] == -1)
								this.xcord-=token.manSpeed;
							dir = "left";
						}
						else{
							if(rightmove && token.backgrndArray[parseInt(yfactor-0.9999)][parseInt(xfactor)] == -1)
								this.xcord+=token.manSpeed;
							if(xfactor%2!=1)
								dir = "right";
						}
				break;
			case "down":
				if(downmove && verimove)	this.ycord+=token.manSpeed;
				else
					if(yfactor<13)
					if(horimove)
						if(xfactor%2>1){
							if(leftmove && token.backgrndArray[parseInt(yfactor+1)][parseInt(xfactor+0.9999)] == -1)
								this.xcord-=token.manSpeed;
							dir = "left";
						}
						else{
							if(rightmove && token.backgrndArray[parseInt(yfactor+1)][parseInt(xfactor)] == -1)
								this.xcord+=token.manSpeed;
							if(xfactor%2!=1)
								dir = "right";
						}
				break;
			case "bomb":
				if(token.backgrndArray[parseInt(yfactor+0.5)][parseInt(xfactor+0.5)] == 0 && this.bombAllow==0){
					this.bombAllow = token.backgrndArray[parseInt(yfactor+0.5)][parseInt(xfactor+0.5)] = 50 ;
					this.moveOnBombAllow = true;
				}
				break;
		}
		if(this.moveOnBombAllow
			&& token.backgrndArray[parseInt(yfactor)][parseInt(xfactor+0.9999)] == 0
			&& token.backgrndArray[parseInt(yfactor)][parseInt(xfactor)] == 0
			&& token.backgrndArray[parseInt(yfactor+0.9999)][parseInt(xfactor)] == 0
			&& token.backgrndArray[parseInt(yfactor)][parseInt(xfactor)] == 0)
			this.moveOnBombAllow = false ;

		if(this.bombAllow > 0)
			this.bombAllow--;

		this.direct = dir;
		if(token.printList)
			token.printList.push(this.printMan(dir));
	};

	object.prototype.getCenter = function() {
		return {
			x : this.xcord+16,
			y : this.ycord+16
		};
	};

	man.handler = function(d) {
		this.move = function(update, token) {
			var i;
			for(i in this.list) {
				var obj = this.list[i],
					upd = update[i];
				// console.log(upd);
				if(typeof upd == "undefined") upd = {};
				if(typeof upd.alive !== "undefined" && !upd.alive && obj.alive) {
					obj.deathCountdown=60;
					obj.alive=false;
				}
				if(typeof obj.deathCountdown !== "undefined") {
					token.printList.push({
						type : "deadman",
						x : obj.xcord,
						y : obj.ycord,
						z : 20,
						imageNo : obj.deathCountdown--
					})
					if(obj.deathCountdown == 0)
						delete obj.deathCountdown;
				}
				if(obj.alive) {
					var j;
					for(j in obj) if(j in upd && typeof obj[j] !== "function") obj[j] = upd[j];
					// console.log(upd,obj.move);
					obj.move(upd.move||"stand",token);
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
				this.list[data[i].id] = new object(data[i].x,data[i].y);
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
		if(typeof d !== "undefined")
			this.create(d);
	}
});