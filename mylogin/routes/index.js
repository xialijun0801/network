
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

    var defaultCoding = getDefaultCodingMap();

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
	
	Problem.findOne({_id: problemId}, function(err, theproblem) {
		if(err) {
			return console.log("error to get probelms");
		}
		else  {
			problem = theproblem;
		}

		if(hasText && (language === 'C' || language === 'Java' || language === 'C++')) {
			var err = compile(coding, language, req, res, problem);
        }
	});
});

function compile(coding, language, req, res, problem) {
	console.log(language);

	var compileLanguage = ['C', 'C++', 'Java'];
	var commands= {};
	commands['C'] = 'gcc -o';
	commands['C++'] = 'g++ -o';
	commands['Java'] = 'javac';

	var username = req.session.username;
	var outputFilename = 'output/temp'+ username+problem._id;
	if(language === 'C') {
		inputFilename = outputFilename + '.c';
	}
	else if (language === 'C++') {
		inputFilename = outputFilename + '.cpp';
	}
	else if(language === 'Java'){
		inputFilename = 'output/HelloWorld.java';
	}

    console.log(inputFilename);
    var command = commands[language];

	if(language === 'C' || language == "C++") {
		command = command + ' ' + outputFilename +'.out';
	}
	command = command + ' ' + inputFilename;

	console.log(command);

    fs = require('fs');
    fs.writeFile(inputFilename, coding, function (err) {
		if (err) 
			return console.log(err);

		const exec = require('child_process').exec;
		const child = exec(command, function(error, stdout, stderr) {
			var err = [];	
	        var hasError = false;
		    if (error) {
			    console.error('stderr', stderr);
			    err.push(stderr);
			    hasError = true;
            }
            res.render('problem/codeinput', { 
            	    hasError: hasError,
            	    hasText: true,
    	            stderr : err,
    	            problem: problem,  
		            username: req.session.username,
		            editContent: coding,
		            languageS: language,
		            defaultCoding: getDefaultCodingMap(),
		            csrfToken: req.csrfToken()
	                }); 
        });
	});
}

function getDefaultCodingMap() {
	var defaultCoding = {};
    var languages = ['C', 'C++', 'Java'];
    for (var i = 0; i < languages.length; ++i) {
    	defaultCoding[languages[i]] = (getDefaultCoding(languages[i]));
    }
    return defaultCoding;
}

function getDefaultCoding(language) {
	if(language == 'C') {
		return "#include <stdio.h>\n\
	\n\
int main()\n\
{ \n\
        printf(\"Hello, World!\\n\");\n\
\n\
        return 0;\n\
}"
	}
	else if (language == 'C++') {
		return "#include <iostream>\n\
#include <string>\n\
\n\
int main()\n\
{\n\
        std::string name;\n\
        std::cout << \"What is your name? \";\n\
        getline (std::cin, name);\n\
        std::cout << \"Hello, \" << name;\n\
}"
	}
	else if (language == 'Java') {
		return "public class HelloWorld{\n\
\n\
        public static void main(String []args){\n\
                System.out.println(\"Hello World\");\n\
        }\n\
}"
	}
}

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
	res.redirect('/');
}
