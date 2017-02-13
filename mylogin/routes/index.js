
module.exports = router;

var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');


var csrfProtection = csrf();
router.use(csrfProtection);

var pug = require('pug');
var fs = require('fs');

var Problem = require('../models/problem');
var Compiler = require('../compilers/compiler');
/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

var g_problems = undefined;
var g_problemsMap = {};

router.get('/profile', isLoggedIn, function(req, res, next){
	var username = req.flash('username');
	res.render('user/profile', { username : username});
});

router.get('/problems', isLoggedIn, function(req, res, next){
    var problems = g_problems;
    if(problems !== undefined && problems.length >0) {
    	var pages = getPages(problems);
    	var pagenumber = 1;
    	var firstpage = getProblemsInPage(problems, pagenumber);
    	res.render('problem/problems', { 
    		problems : firstpage, 
    		pages: pages, pagenumber: pagenumber,  
    		username: req.session.username});
    	return;
    }
    
	Problem.find({}, function(err, allproblems) {
		var username = req.flash('username');
		if(err) {
			return console.log("error to get probelms");
		}
		else if (allproblems.length === 0) {
			console.log("There are no problems yet");
			res.render('problem/problems', { problems: {}, messages: ["There are no problems yet"], 
				                             pagenumber:1,
				                             username:req.session.username});
		}
		else {
			//store all problems in memory
			g_problems = allproblems;
			var len = allproblems.length;

			for(var i = 0; i < len; ++i) {
				g_problemsMap[allproblems[i]._id] = allproblems[i]; 
			}
			
            var pages = getPages(allproblems);
			var pagenumber = 1;
			var problems = getProblemsInPage(allproblems, 1);
			res.render('problem/problems', { problems : problems, 
				pages: pages, pagenumber: pagenumber,  username: req.session.username});
		}

	});
});

router.get('/problems/:pagenumber', isLoggedIn, function(req, res, next){
    var problems = g_problems;
    console.log(req.session.username);
    var pagenumber = req.params.pagenumber;
    if(problems !== undefined) {
    	var problemsInPage = getProblemsInPage(problems, pagenumber);
    	var pages = getPages(problems);
    	res.render('problem/problems', { problems : problemsInPage, pages: pages, 
    		pagenumber: pagenumber,  username: req.session.username});
    }
    else {
    	console.log("error: problems missing");
    }
});

function getPages(allproblems) {
	var size = allproblems.length;
	return Math.ceil(size/10);
}

function getProblemsInPage(allproblems, pagenumber) {

	var indexbegin = 10* (pagenumber-1);
	var indexend = 10* (pagenumber);
	if(indexend < allproblems.length) {
		return allproblems.slice(indexbegin, indexend);
	}
	else {
		return allproblems.slice(indexbegin);
	}
}

router.get('*/problems/tackle-view/:problemId', isLoggedIn, function(req, res, next){
    var problemId = req.params.problemId;
    var problem = g_problemsMap[problemId];
    if(problem === undefined) {
    	Problem.findOne({_id: problemId}, function(err, theproblem) {
		if(err) {
			console.log("error to get probelms");
			res.render('index', { title: 'Express' });
		}
		else  {
			problem = theproblem;
		}});
    }

    var defaultCoding = Compiler.GetDefaultCodingMap();

    res.render('problem/codeinput', { 
    	hasError: false,
    	hasText:false,
    	problem: problem,  
    	defaultCoding: defaultCoding,
		username: req.session.username,
		csrfToken: req.csrfToken()
	    });
});

router.post('/problems/codeinput', function(req, res, next) {
	var coding = req.body.editContent;
	var language = req.body.language;
	var problemId = req.body.problemId;
	var problem = null;
	var hasText = (coding !== "");
	console.log(hasText);
	console.log(language);
	

	Problem.findOne({_id: problemId}, function(err, theproblem) {
		if(err) {
			return console.log("error to get probelms");
		}
		else  {
			problem = theproblem;
		}

		if(hasText && (language === 'C' || language === 'Java' || language === 'C++')) {
			Compiler.Compile(coding, language, req, res, problem);
        }
        else if (hasText && language === 'Python') {
        	Compiler.PythonSandbox(coding, problem, req, res);
        }
        else if (hasText && language == 'Java Script') {
        	//javaScriptSandbox(coding, problem, req, res);
        	Compiler.JavaScriptSandbox(coding, problem, req,res);
        }
        else if(!hasText) {
        	var err = ["The input is empty, please make sure the input is valid"];
		    res.render('problem/codeinput', { 
            	    hasError: true,
            	    hasText: false,
    	            stderr : err,
    	            problem: problem,  
		            username: req.session.username,
		            editContent: coding,
		            languageS: language,
		            defaultCoding: Compiler.GetDefaultCodingMap(),
		            csrfToken: req.csrfToken()
	                });
		}
	});
});



router.get('/logout', function(req, res, next){
	req.logout();
	res.redirect('/');
});


router.get('/signup', function(req, res, next) {
	var messages = req.flash('error');
  res.render('user/signup', {csrfToken: req.csrfToken(), messages: messages});
});

router.post('/signup', passport.authenticate('local.signup', {
	successRedirect: 'profile',
	failureRedirect: 'signup', 
	failureFlash: true
}));

router.get('/signin', function(req, res, next){
	//res.send('singup page');
	var messages = req.flash('error');
	res.render('user/signin', {csrfToken : req.csrfToken(), messages : messages});
});

router.post('/signin', passport.authenticate('local.signin', {
		successRedirect: '/profile',
		failureRedirect: '/signin',
		failureFlash: true
}));

module.exports = router;

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/signin');
}


