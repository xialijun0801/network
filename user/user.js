var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

UserSchema = new Schema({
	firstname:String,
	lastname: String,
	email:    {type:String, required:true, index:{unique:true}},
	username: {type:String, required:true, index:{unique:true}},
	password: {type:String, required:true, select:true},
});


/*UserSchema.pre('save', function(next) {
	var user = this;
	if(!user.isModified('password')) return next();
	bcrypt.hash(user.password, null, null, function(err, hash) {
		if(err) return next(err);
		user.password = hash;
		next();
	});
});*/

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, null, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(callback);
	        console.log("saved user: " + newUser);
	    });
	});
}

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}


module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) {
    		console.log("errors:  " + err);
    		callback(null,false);
    	}
    	else {
    		console.log("isMatch: " + isMatch);
    		callback(null, isMatch);
    	}
	});
}

function createToken(user) {
	var token = jsonwebtoken.sign({
		firstname:user
	})
}