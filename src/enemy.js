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
				x : this.xcord+16,
				y : this.ycord+32,
				image : this.imageIndex%4
			}
		this.imageIndex++;
		return result;
	};

	object.prototype.Move = function(token)	{
		switch(this.direct){
			case 'left':
				if(token.backgrndArray[parseInt(this.ycord/32)][parseInt(this.xcord/32-0.001)] == 0)
					this.xcord -=token.enemySpeed;
				break;
			case 'right':
				if(token.backgrndArray[parseInt(this.ycord/32)][parseInt(this.xcord/32+1.001)] == 0)
					this.xcord +=token.enemySpeed;
				break;
			case 'up':
				if(token.backgrndArray[parseInt(this.ycord/32-0.001)][parseInt(this.xcord/32)] == 0)
					this.ycord -=token.enemySpeed;
				break;
			case 'down':
				if(token.backgrndArray[parseInt(this.ycord/32+1.001)][parseInt(this.xcord/32)] == 0)
					this.ycord +=token.enemySpeed;
				break;
		}
		token.printList.push(this.printEnemy());
		this.automator();
	};

	object.prototype.automator = function() {
		if(this.xtemp == this.xcord && this.ytemp == this.ycord){
			cha = this.xcord + this.ycord + this.prevMove;
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

	enemy.handler = function(){
		this.move = function(update, token) {
			for(i in this.list) {
				var obj = this.list[i],
					upd = update[i];
				if(typeof upd.alive !== "undefined" && !upd.alive && obj.alive) {
					obj.deathCountdown=100;
					obj.alive=false;
				}
				if(typeof obj.deathCountdown !== "undefined"){
					token.printList.push({
						type : "deadenemy",
						x : obj.xcord,
						y : obj.ycord,
						imageNo : obj.deathCountdown--
					});
					if(obj.deathCountdown == 0)
						delete obj.deathCountdown;
				}
				else {
					for(j in obj) if(j in upd) obj[j] = upd[j];
					obj.move(token);
				}
			}
		};

		this.list = {};
		this.count = 0;
		this.create = function(x,y,d,id) {
			this.list[id] = new object(x,y,d);
			this.count++;
		}
	}
});