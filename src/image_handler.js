(function(global, factory){
	if(typeof define==="function" && define.amd)
		define(['exports'], factory) //AMD
	else factory(global);
})(typeof window === "object" ? window.ImageHandler = {} : module.exports,
function(img){
	var object = function(imageName){
		var img = new Image(),
			that = this;
		img.onload = function() {
			switch(that.type) {
				case 'enemy' :
				case 'man' :
					that.ycorr = 20-this.height;
					that.z = 20;
					break;
				case 'box' :
					that.ycorr = 0;
					that.z = 10;
					break;
				default :
					that.ycorr = 0;
					that.z = 0;
					break;
			}
		}
		this.image = new createjs.Bitmap(img);
		this.imageName = imageName.split('.').slice(0,-1).join('.');
		this.type = imageName.split('.')[0];
		this.imageNo = parseInt(imageName.split('.')[1]); 
		img.src = "/images/"+imageName;
	};
	img.list = {};
	img.count = 0;
	img.canvas = (function (w,h){
		var c = document.createElement("canvas");
			c.width = w;
			c.height = h;
		return c;
	})(640,480);
	img.stage = new createjs.Stage(img.canvas);
	img.create = function(names) {
		if(typeof names === "string")
			names = [names];
		var i;
		for(i in names){
			img.list[img.count] = new object(names[i]);
			img.count++;
		}
	}
	img.onDocumentLoad = function() {
		document.body.appendChild(img.canvas);
	}
	img.getImage = function(data) {
		var i;
		for(i in img.list)
			if(img.list[i].type == data.type && (img.list[i].imageNo == '' || img.list[i].imageNo == data.imageNo))
				return img.list[i];
	}
	img.render = function(list) {
		img.stage.removeAllChildren();
		list.sort(function(a,b){return a.z-b.z});
		for(var i=0; i<list.length; i++) {
			var o=img.getImage(list[i]);
			o.image.x = list[i].x;
			o.image.y = list[i].y + list[i].ycorr;
			img.stage.addChild(o.image);
		}
		img.stage.update();
	}
})