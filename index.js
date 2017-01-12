
var path = require("path");
var express = require("express");
var app = express();
//var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/loginapp');
//var db = mongoose.connection;

//var morgan = require('morgan')

//app.use(morgan('combined'))
app.use(express.static(__dirname+'/image'));
app.use(express.static(__dirname+'/node_modules/angular/angular.js'));

app.use("/login", express.static(path.join(__dirname, "login")));
app.use("/register", express.static(path.join(__dirname, "register")));
app.use("/home", express.static(path.join(__dirname, "home")));

/*app.get("/",function(req,res){
    res.sendFile(path.join(__dirname, "test.html"));
});*/

app.get("/",function(req,res){
    res.sendFile(path.join(__dirname, "home/home.view.html"));
});

app.get("/login",function(req,res){
    res.sendFile(path.join(__dirname, "login/login.view.html"));
});

app.get("/register",function(req,res){
    res.sendFile(path.join(__dirname, "register/register.view.html"));
});

/**************************/

app.listen(80, function(err) {
   if(err){
       console.log(err); 
   } else {
       console.log("Listening on port 80");  
   }
});
