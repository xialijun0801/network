var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done){
	done(null, user.id);
});

passport.deserializeUser(function(id, done){
	User.findById(id, function(err, user){
		done(err, user);
	})
});

passport.use('local.signup', new LocalStrategy({
	//username2Field: 'username',
	usernameField:'email',
	passwordField:'password',
	passReqToCallback: true
}, function(req, email, password, done){
	console.log(email);
	req.checkBody('username', 'Please input your username').notEmpty();
	req.checkBody('email', 'Invalid email address').notEmpty().isEmail();
	req.checkBody('password', 'Invalid password').notEmpty().isLength({min:6});
	req.checkBody('password', 'Password and confirm password do not match').equals(req.body.confirmPassword);
	var errors = req.validationErrors();
	if(errors){
		var messages = [];
		errors.forEach(function(error){
			messages.push(error.msg);
		});
		return done(null, false, req.flash('error', messages));
	}
	User.findOne({'email':email}, function(err, user){
		if(err){
			return done(err);
		}
		if(user){
			return done(null, false, {message:'Email is already in use'});
		}
		User.findOne({'username':req.body.username}, function(err, user){
			if(err){
				return done(err);
			}
			if(user){
				return done(null, false, {message:'Username is already in use'});
			}
			var newUser = new User();
			newUser.username = req.body.username;
			newUser.email = email;
			newUser.password = newUser.encryptPassword(password);
			newUser.save(function(err, result){
				if(err){
					return done(err);
				}
				req.session.username = req.body.username;
				return done(null, newUser, req.flash('username', req.body.username));
			});
		});
	});
}));

passport.use('local.signin', new LocalStrategy({
	usernameField:'username',
	passportField:'passport',
	passReqToCallback: true
},  function(req, username, password, done){
	req.checkBody('username', 'Please input your username').notEmpty();
	req.checkBody('password', 'Invalid password').notEmpty().isLength({min:6});

	var errors = req.validationErrors();
	if(errors){
		var messages = [];
		errors.forEach(function(error){
			messages.push(error.msg);
		});
		return done(null, false, req.flash('error', messages));
	}
	User.findOne({'username':username}, function(err, user){
	if(err){
		return done(err);
	}
	if(!user){
		return done(null, false, {message:'No user find'});
	}
	if (!user.validPassword(password)){
		return done(null, false, {message: 'Wrong password.'});
	}
	req.session.username = username;
	req.session.password = password;
	return done(null, user, req.flash('username', req.body.username));
	});
}));