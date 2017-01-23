var path = require("path");
var express = require("express");
var bodyParser = require('body-parser');
var jsonwebtoken = require('jsonwebtoken');
var router = express.Router();
var app = express();

router.get("/login",function(req,res){
    res.sendFile(path.join(__dirname, "../login/login.view.html"));
});

router.get("/register",function(req,res){
    res.sendFile(path.join(__dirname, "../register/register.view.html"));
});

var User = require('../model/user');
var Coding = require('../model/coding');

router.post('/login/process', function(req,res,next) {

	console.log("get username " + req.body.username);
	var username = req.body.username;
	var password = req.body.password;

	User.getUserByUsername(username, function(err, user) {
		var response = {
			"message" :"",
			"success" : false,
			"token"  : ""
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
 	    User.comparePassword(password, user.password, function(err, isMatch) {
 	    	if(err) {
 	    		resonse["message"] = "Unknown Error";
 	    		console.log("Compare error");
 	    		res.end(JSON.stringify(response));
 	    	}
 	    	else if(isMatch) {
 	    		response["success"] = true;
 	    		response["token"] = createToken(user);
                response["message"] = "Login successfully";
 	    		console.log("Successfully logged in:");
 	    		console.log(response);
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


router.post('/register/process', function(req,res,next) {
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

router.use('/coding', function(req, res, callback) {
	console.log("The app is visited");
	console.log(req.param);
	var token = req.body.token || req.param('token') || req.headers['x-access-token'];
	if(token){
		jsonwebtoken.verify(token, "MySecretKey", function(err,decoded) {
			if(err){
				console.log("Token Verify failed");
			}
			else {
				req.decoded = decoded;
				console.log("Verified token");
				callback();
			}
		});
	}
	else{
		console.log("No token provided");
		res.status(403).send({ success: false, message: "No Token Provided"});
	}
});

router.route('/coding')
    .post(function (req, res) {
    	console.log(req.decoded);
    	var coding = new Coding({
    		creator: req.decoded.id,
    		content: req.body.content,
    		language: req.body.language
    	}); 

    	coding.save(function(err) {
    		if(err) {
    			res.end(err);
    		}
    		res.end(JSON.stringify({messasge: " New Coding Record Created"}));
    	}) ;	
    })


    .get(function(req,res) {
    	Coding.find({creator: req.decoded.id}, 
    		function(err, codings){
    			if(err) {
    				res.end(err);
    				return;
    			}
    			res.redirect('/coding');
    			res.end(codings);
    		})
    });

router.get('/me', function(req, res) {
	console.log(req);
	console.log(req.decoded);
	res.end(JSON.stringify(req.decoded));
});

function createToken(user) {
	var token = jsonwebtoken.sign(
	{
		id: user._id,
		username: user.username,
		email:user.email
	}, "MySecretKey", {
		expiresIn: '100h'
	});
	return token;
}


module.exports = router;
