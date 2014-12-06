requirejs.config({
	baseUrl : '',
	paths : {
		bomberMan : "bomber_man",
		enemy : "enemy",
		imageHandler : "image_handler",
		game : "game",
		easeljs : "easeljs/lib/easeljs-0.7.1.combined",
		socketio : "socket.io/socket.io"
	},
	shim : {
		game : {
			deps : [
			'enemy',
			'bomberMan',
			'imageHandler'
			]	
		},
		imageHandler : {
			deps : ["easeljs"]
		},
		easeljs : {
			exports : 'createjs'
		},
		socketio : {
			exports : 'io'
		}
	}
});

require(['imageHandler'], function (game) {
	
})