(function(global, factory){
	if(typeof define==="function" && define.amd)
		define(['exports'], factory) //AMD
	else factory(global);
})(typeof window === "object" ? window.GameImage={} : module.exports = {},
function(img){
	var object = function(imageName){
		var image = new Image(),
			that = this;
		image.onload = function() {
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
		this.image = new createjs.Bitmap(image);
		this.imageName = imageName.split('.').slice(0,-1).join('.');
		this.type = imageName.split('.')[0];
		this.imageNo = parseInt(imageName.split('.')[1]); 
		image.src = "/images/"+imageName;
	};
	img.handler = function(){
		this.list = {};
		this.count = 0;
		this.canvas = (function (w,h){
			var c = document.createElement("canvas");
				c.width = w;
				c.height = h;
			return c;
		})(640,480);
		this.stage = new createjs.Stage(this.canvas);
		this.create = function(names) {
			if(typeof names === "string")
				names = [names];
			var i;
			for(i in names){
				this.list[this.count] = new object(names[i]);
				this.count++;
			}
		}
		this.onDocumentLoad = function() {
			document.body.appendChild(this.canvas);
		}
		this.getImage = function(data) {
			var i;
			for(i in this.list)
				if(this.list[i].type == data.type && (this.list[i].imageNo == '' || this.list[i].imageNo == data.imageNo))
					return this.list[i];
		}
		this.render = function(list) {
			this.stage.removeAllChildren();
			list.sort(function(a,b){return a.z-b.z});
			for(var i=0; i<list.length; i++) {
				var o=this.getImage(list[i]);
				o.image.x = list[i].x;
				o.image.y = list[i].y + list[i].ycorr;
				this.stage.addChild(o.image);
			}
			this.stage.update();
		}
	}
})