var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var problemSchema = new Schema({
	problemTitle: {type: String, required: true, index:{unique:true}},
	problemContents: {type: String, required: true},
});



module.exports.createProblem = function(newproblem, callback){
	newproblem.save(function(err, problem){
		if(err){
			onErr(err,callback);
		} else {
			mongoose.connection.close();
			console.log(problem);
			console.log( "is saved");
			callback("", problem);
		}
	});
}

module.exports.getProblemById = function(title, callback){
	var query = {problemTitle: title};
	Problem.findOne(query, function(err, problem){
		if(err){
			onErr(err, callback);
		}
		else {
			mongoose.connection.close();
			console.log(problem);
			console.log(" is found");
			callback("", problem);
		}
	});
}

module.exports.getAllProblems = function(callback){
	var query = {};
	Problem.find(query, function(err, problems) {
		if(err) {
			onErr(err, callback);
		}
		else {
			mongoose.connection.close();
			console.log("list all roblems");
			console.log(problems);
			callback("", problems);
		}
	}); 
}

var onErr = function(err,callback) {  
  mongoose.connection.close();
  callback(err);
};

var Problem = module.exports = mongoose.model('Problem', problemSchema);
