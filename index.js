
var path = require("path");
var express = require("express");
var bodyParser = require('body-parser');

var app = express();
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

//var morgan = require('morgan')

//app.use(morgan('combined'))
app.use(express.static(__dirname+'/image'));
app.use("/angular", express.static(path.join(__dirname,"node_modules/angular")));
app.use("/login", express.static(path.join(__dirname, "login")));
app.use("/register", express.static(path.join(__dirname, "register")));
app.use("/home", express.static(path.join(__dirname, "home")));

//all these could be moved to another file
app.get("/",function(req,res){
    res.sendFile(path.join(__dirname, "home/home.view.html"));
});

app.get("/login",function(req,res){
    res.sendFile(path.join(__dirname, "login/login.view.html"));
});

app.get("/register",function(req,res){
    res.sendFile(path.join(__dirname, "register/register.view.html"));
});

app.get("/coding",function(req,res){
    res.sendFile(path.join(__dirname, "coding/coding.view.html"));
})

var User = require('./user/user');

app.post('/login/process', function(req,res,next) {

	console.log("get username " + req.body.username);
	var username = req.body.username;
	var password = req.body.password;

	User.getUserByUsername(username, function(err, user) {
		var response = {
			"message" :"",
			"success" : false,
			"cookie"  : ""
		};
	
 	    if(err) {
 	    	console.log("Error");
 	    	resonse["message"] = "Unknown Error";
 	    	res.end(JSON.stringify(response));
 	    	return;
 	    		//throw err;
 	    }
 	    if(!user) {
 	    	console.log("The user is Not recorded");
 	    	response["message"] = "Unknown User";
 	    	res.end(JSON.stringify(response));
 	    	return;
 	    }

 	    console.log(user);
 	  
 	    console.log("compare passwords: " + password + " " + user.password);
 	    
 	    User.comparePassword(password, user.password, function(err, isMatch) {
 	    	if(err) {
 	    		resonse["message"] = "Unknown Error";
 	    		console.log("Compare error");
 	    		res.end(JSON.stringify(response));
 	    	}
 	    	else if(isMatch) {
 	    		response["success"] = true;
                response["message"] = "Login successfully";
 	    		console.log("Successfully logged in");
 	    		res.end(JSON.stringify(response));
 	    	}
 	    	else {
 	    		 response["message"] = "Invalid Password";
 	    		 console.log("Invalid password");
 	    		 res.end(JSON.stringify(response));
 	    	}
 	    });
 	});
});


app.post('/register/process', function(req,res,next) {
	var user = req;
	console.log("get username" + user.body.username);
	var username = user.body.username;
	var firstname = user.body.firstname;
	var lastname = user.body.lastname;
	var email = user.body.email;
	var password = user.body.password;


    var response = {
			"message" : "",
			"success" : true,
			"cookie"  : ""
	};

	var newUser = new User( {
            test    :" eeeetest",
 	    	firstname: firstname,
 	    	lastname: lastname,
 	    	email:email,
 	    	username:username,
 	    	password:password,
 	    });

	User.createUser(newUser, function(err, user){
		if(err) {
			response["message"] = "Register Failed " + err;
			response["success"] = false;
			console.log("error : " + err);
			res.end(JSON.stringify(response));
		};
		res.end(JSON.stringify(response));
    });
});

function createToken(user) {
	var token = jsonwebtoken.sign(
	{
		username: user.username,
		email:user.email
	}, superSecret, {
		expiresIn: '100h'
	});
}

app.listen(80, function(err) {
   if(err){
       console.log(err); 
   } else {
       console.log("Listening on port 80");  
   }
});
