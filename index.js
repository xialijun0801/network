
var path = require("path");
var express = require("express");
var bodyParser = require('body-parser');
var jsonwebtoken = require('jsonwebtoken');

var app = express();
var userRoutes = require('./router/user');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost', function(err) {
	if(err) {
		console.log(err);
	}
	else {
		console.log('Connected to the database');
	}
});
var db = mongoose.connection;


app.use(express.static(__dirname+'/image'));
app.use('/', userRoutes);
app.use("/angular", express.static(path.join(__dirname,"node_modules/angular")));
app.use("/login", express.static(path.join(__dirname, "login")));
app.use("/register", express.static(path.join(__dirname, "register")));
app.use("/home", express.static(path.join(__dirname, "home")));

//all these could be moved to another file
app.get("/",function(req,res){
    res.sendFile(path.join(__dirname, "home/home.view.html"));
});



app.listen(80, function(err) {
   if(err){
       console.log(err); 
   } else {
       console.log("Listening on port 80");  
   }
});
