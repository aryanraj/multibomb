"use strict";
(function(global,factory){
	if(typeof define==="function" && define.amd)
		define(['exports'], factory) //AMD
	else factory(global);
})(typeof window === "object" ? window.IntervalProcess = {} : module.exports = {},
function(proc){
	var object = function(config) {
		this.data = config.data || {};
		this.iterativeData = config.iterativeData;
		this.initialization = config.initialization;
		this.exec = config.exec;
		this.end = config.end;
		this.counter = 0;
	};

	object.prototype.execute = function(endTime) {
		if(this.counter == 0)
			this.initialization();
		while(this.counter < this.iterativeData.length) {
			if((new Date()).getTime() > endTime)
				return false;
			this.exec(this.iterativeData[this.counter++]);
		}
		this.end();
		return true;
	};

	proc.list = {};
	proc.count = 0;
	proc.create = function(data) {
		proc.list[data.name] = new object(data.config);
		proc.list[data.name].repeat = data.repeat;
		proc.count++;
	};
	proc.execute = function(endTime, names) {
		if(typeof names == "undefined") {
			names = [];
			for(var i in proc.list)
				names.push(i);
		}
		else if(~["string","number"].indexOf(typeof names))
			names = [names];
		for(var i in names) {
			// console.log(names[i], proc.list);
			if(proc.list[names[i]].execute(endTime)) {
				if(proc.list[names[i]].repeat)
					proc.list[names[i]].counter = 0;
				else {
					delete proc.list[names[i]];
					proc.count--;
				}
			}
		}
	};
});