var express=require('express.io'),
	app=express().http().io();

app.use(express.static(__dirname+'/src'));
app.use(express.static(__dirname+'/public'));

app.get('/', function(req,res){
	res.sendfile(__dirname+'/public/index.html');
})

app.io.on('connection', function(){
	console.log('connection made')
})

app.listen(8080);