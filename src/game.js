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
		this.timeStamp = {};
	};

	object.prototype.background = function() {
		if(this.token.printList) {
			this.token.printList.push({
				type : 'bk',
				x : 0,
				y : 0
			});
			var i,j;
			for(i in this.token.backgrndArray)
				for(j in this.token.backgrndArray[i])
					if(this.token.backgrndArray[i][j] == -3)
						this.token.printList.push({
							type : 'box',
							x : j*32+16,
							y : i*32+20
						});
		}
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
			this.man.move(data[i].man, this.token);
			this.enemy.move(data[i].enemy, this.token);
			this.timeStamp[time-this.startTime] = data;
			if(time-this.startTime>10000&&time-this.startTime<10050)
				console.log(Object.keys(this.timeStamp).length);
		}
	};

	game.handler = function(images, data) {
		if(typeof images !== "undefined"){
			this.image = images;
			this.image.onDocumentLoad();
		}
		this.list = {};
		this.count = 0;
		this.printList = [];
		this.create = function(objs) {
			if(!("push" in objs))
				objs = [objs];
			var i;
			for(i in objs) {
				if(objs[i].printable)
					objs[i].t.printList = this.printList;
				this.list[objs[i].id] = new object(objs[i].b,objs[i].e,objs[i].t);
				this.count++;
			}
		}
		this.execute = function(data) {
			var i;
			this.printList.length = 0;
			for(i in this.list)	if(i in data) this.list[i].execute(data[i]);
			if(this.image && data.print)
				this.image.render(this.printList);
			// console.log(this.printList);
		}
		if(typeof data !== "undefined")
			this.create(data);
	}
})