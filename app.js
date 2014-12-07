var express=require('express.io'),
	app=express().http().io(),
	createGame = require(__dirname+'/src/create_game.js'),
	cnf = require(__dirname+'/config/levels')

app.use(express.static(__dirname+'/src'));
app.use(express.static(__dirname+'/public'));
app.use(express.static(__dirname+'/bower_components'));

app.io.route('done', function(req){
	var level1 = createGame(cnf['1'],[req.socket.id]);
	level1.images = cnf["images"];
	req.io.emit("data",level1);
})

app.get('/', function(req,res){
	res.sendfile(__dirname+'/public/index.html');
})

app.io.on('connection', function(){
	console.log('connection made')
})

app.listen(8080);