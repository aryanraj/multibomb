(function(global, factory){
	if(typeof define==="function" && define.amd)
		define(['exports'], factory) //AMD
	else factory(global);
})(typeof window === "object" ? window.Bomberman = {} : module.exports = {} ,
function(man){
	var object = function(x,y){
		this.xcord = x;
		this.ycord = y;
		this.bombAllow = false;
		this.direct = "stand";
		this.alive = true;
		this.imageNo = 3;
		this.imageIndex = 0;
	};

	object.prototype.printMan = function(dir) {
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
		if(this.imageIndex%2==0)
			return {
				x : this.xcord+16,
				y : this.ycord+32,
				image : this.imageNo
			}
		else
			return {
				x : this.xcord+16,
				y : this.ycord+32,
				image : this.imageNo+(this.imageIndex%4+1)/2
			}
		this.imageIndex++;
	};

	object.prototype.move = function(dir, token) {
		xfactor = (this.xcord)/32;
		yfactor = (this.ycord)/32;
		leftmove = token.backgrndArray[parseInt(yfactor)][parseInt(xfactor-0.03125*token.speed)] == 0 
					|| ( token.backgrndArray[parseInt(yfactor)][parseInt(xfactor-0.03125*token.speed)] > 0
							&& this.bombAllow) ? true : false ;
		upmove = token.backgrndArray[parseInt(yfactor-0.03125*token.speed)][parseInt(xfactor)] == 0 
					|| ( token.backgrndArray[parseInt(yfactor-0.03125*token.speed)][parseInt(xfactor)] > 0
							&& this.bombAllow) ? true : false ;
		rightmove = token.backgrndArray[parseInt(yfactor)][parseInt(xfactor+0.03125*token.speed+0.9999)] == 0
					|| ( token.backgrndArray[parseInt(yfactor)][parseInt(xfactor+0.03125*token.speed+0.9999)] > 0
							&& this.bombAllow) ? true : false ;
		downmove = token.backgrndArray[parseInt(yfactor+0.03125*token.speed+0.9999)][parseInt(xfactor)] == 0 
					|| ( token.backgrndArray[parseInt(yfactor+0.03125*token.speed+0.9999)][parseInt(xfactor)] > 0
							&& this.bombAllow) ? true : false ;
		horimove = yfactor%2 == 1 ? true : false;
		verimove = xfactor%2 == 1 ? true : false;

		switch(dir)	{
			case "left":
				if(leftmove && horimove)	this.xcord-=token.speed;
				else
					if(xfactor>1)
					if(verimove)
						if(yfactor%2>1){
							if(upmove && token.backgrndArray[parseInt(yfactor+0.9999)][parseInt(xfactor-0.9999)] == -1)
								this.ycord-=token.speed;
							dir = "up";
						}
						else{
							if(downmove && token.backgrndArray[parseInt(yfactor)][parseInt(xfactor-0.9999)] == -1)
								this.ycord+=token.speed;
							if(yfactor%2!=1)
								dir = "down";
						}
				break;
			case "right":
				if(rightmove && horimove)	this.xcord+=token.speed;
				else
					if(xfactor<17)
					if(verimove)
						if(yfactor%2>1){
							if(upmove && token.backgrndArray[parseInt(yfactor+0.9999)][parseInt(xfactor+1)] == -1)
								this.ycord-=token.speed;
							dir = "up";
						}
						else{
							if(downmove && token.backgrndArray[parseInt(yfactor)][parseInt(xfactor+1)] == -1)
								this.ycord+=token.speed;
							if(yfactor%2!=1)
								dir = "down";
						}
				break;
			case "up":
				if(upmove && verimove)		this.ycord-=token.speed;
				else
					if(yfactor>1)
					if(horimove)
						if(xfactor%2>1){
							if(leftmove && token.backgrndArray[parseInt(yfactor-0.9999)][parseInt(xfactor+0.9999)] == -1)
								this.xcord-=token.speed;
							dir = "left";
						}
						else{
							if(rightmove && token.backgrndArray[parseInt(yfactor-0.9999)][parseInt(xfactor)] == -1)
								this.xcord+=token.speed;
							if(xfactor%2!=1)
								dir = "right";
						}
				break;
			case "down":
				if(downmove && verimove)	this.ycord+=token.speed;
				else
					if(yfactor<13)
					if(horimove)
						if(xfactor%2>1){
							if(leftmove && token.backgrndArray[parseInt(yfactor+1)][parseInt(xfactor+0.9999)] == -1)
								this.xcord-=token.speed;
							dir = "left";
						}
						else{
							if(rightmove && token.backgrndArray[parseInt(yfactor+1)][parseInt(xfactor)] == -1)
								this.xcord+=token.speed;
							if(xfactor%2!=1)
								dir = "right";
						}
				break;
			case "bomb":
				if(token.backgrndArray[parseInt(yfactor+0.5)][parseInt(xfactor+0.5)] == 0){
					token.backgrndArray[parseInt(yfactor+0.5)][parseInt(xfactor+0.5)] = 100 ;
					this.bombAllow = true;
				}
				console.log(dir);
				break;
		}
		if(this.bombAllow
			&& token.backgrndArray[parseInt(yfactor)][parseInt(xfactor+0.9999)] == 0
			&& token.backgrndArray[parseInt(yfactor)][parseInt(xfactor)] == 0
			&& token.backgrndArray[parseInt(yfactor+0.9999)][parseInt(xfactor)] == 0
			&& token.backgrndArray[parseInt(yfactor)][parseInt(xfactor)] == 0)
			this.bombAllow = false ;

		this.direct = dir;
		token.printList.push(this.printMan(dir));
	};

	man.list = {};
	man.count = 0;
	man.create = function(x,y,id) {
		man.list[man.count] = man.list[id] = new object(x,y);
		man.count++;
	}
});