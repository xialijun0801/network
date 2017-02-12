
module.exports = router;

var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var Sandbox = require('docker-python-sandbox');
var JavaSandbox = require('../sandbox/lib/sandbox');


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
			var err = compile(coding, language, req, res, problem);
        }
        else if (hasText && language === 'Python') {
        	pythonSandbox(coding, problem, req, res);
        }
        else if (hasText && language == 'Java Script') {
        	javaScriptSandbox(coding, problem, req, res);
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
		            defaultCoding: getDefaultCodingMap(),
		            csrfToken: req.csrfToken()
	                });
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
	var outputFileName = 'output/temp'+ username+problem._id;

	
	if(language === 'C') {
		inputFilename = outputFileName + '.c';
	}
	else if (language === 'C++') {
		inputFilename = outputFileName + '.cpp';
	}
	else if(language === 'Java'){
		inputFilename = 'output/HelloWorld.java';
	}

    console.log(inputFilename);
    var command = commands[language];

    var executableFileName = "";

	if(language === 'C' || language == "C++") {
		executableFileName = outputFileName + ".out";
		command = command + ' ' + executableFileName;
	}
	command = command + ' ' + inputFilename;

	console.log(command);

    fs = require('fs');
    fs.writeFile(inputFilename, coding, function (err) {
		if (err) 
			return console.log(err);

		const exec = require('child_process').exec;
		const child = exec(command, function(error, stdout, stderr) {
			console.log("compile code");
			var err = [];	
	        var hasError = false;
	        var runtime = false;
	        var output = "";
		    if (error) {
			    console.error('stderr', stderr);
			    err.push(stderr);
			    hasError = true;
			    res.render('problem/codeinput', { 
            	    hasError: true,
            	    hasText: true,
    	            stderr : err,
    	            problem: problem,  
		            username: req.session.username,
		            editContent: coding,
		            languageS: language,
		            defaultCoding: getDefaultCodingMap(),
		            csrfToken: req.csrfToken()
	                }); 
            }
            else {
            	var runningCodeCommand = "./"+ executableFileName;

            	if(language === 'Java') {
            		runningCodeCommand = "cd output; java HelloWorld";
            	}

            	console.log(runningCodeCommand);

            	exec(runningCodeCommand, function(error, stdout,stderr){
            		console.log("running code");
            		if (error) {
            			err.push(stderr);
            			hasError = true;
            		}
            		else {
            			runtime= true,
            			output = stdout
            		}
            		console.log("runtime: " + runtime);
            		console.log("output: " + stdout);
            		res.render('problem/codeinput', { 
            	    hasError: hasError,
            	    hasText: true,
    	            stderr : err,
    	            runtime : runtime,
    	            codeRunarea: output,
    	            problem: problem,  
		            username: req.session.username,
		            editContent: coding,
		            languageS: language,
		            defaultCoding: getDefaultCodingMap(),
		            csrfToken: req.csrfToken()
	                }); 
            		
            	});
            }
            
        });
	});
}

function getDefaultCodingMap() {
	var defaultCoding = {};
    var languages = ['C', 'C++', 'Java', 'Python', 'Java Script'];
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
	else if (language == "Python") {
		return "print \"Hello World!\\n\"";
	}

	else if (language == "Java Script") {
		return "console.log(\"Hello, world!\")";
	}
}

function pythonSandbox(pythoncoding, problem, req, res) {
	const poolSize = 5;
	var mySandbox = new Sandbox({poolSize});

    var hasError = false;
  
	mySandbox.initialize(err => {
        if (err) console.log(`unable to initialize the sandbox: ${err}`)
  
        const code = pythoncoding;
        const timeoutMs = 100;
        mySandbox.run({code, timeoutMs}, (err, result) => {
        	res.render('problem/codeinput', { 
            	    hasError: result.isError,
            	    hasText: true,
            	    runtime: true,
            	    stderr : [],
    	            codeRunarea: result.combined,
    	            problem: problem,  
		            username: req.session.username,
		            editContent: code,
		            languageS: 'Python',
		            defaultCoding: getDefaultCodingMap(),
		            csrfToken: req.csrfToken()
	                });
        })
    });
}

function javaScriptSandbox(javaScriptCoding, problem, req, res) {
	var s = new JavaSandbox();
	s.run( javaScriptCoding, function( output ) {
		var codeRunarea = output.result + '\n' + output.console;
		res.render('problem/codeinput', { 
            	    hasError: false,
            	    hasText: true,
            	    runtime: true,
            	    stderr : [],
    	            codeRunarea: codeRunarea,
    	            problem: problem,  
		            username: req.session.username,
		            editContent: javaScriptCoding,
		            languageS: 'Java Script',
		            defaultCoding: getDefaultCodingMap(),
		            csrfToken: req.csrfToken()
	                });
	});
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


