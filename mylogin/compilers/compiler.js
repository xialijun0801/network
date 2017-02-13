var JavaSandbox = require('../sandbox/lib/sandbox');
var PythonSandbox = require('docker-python-sandbox');


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


function getDefaultCodingMap() {
	var defaultCoding = {};
    var languages = ['C', 'C++', 'Java', 'Python', 'Java Script'];
    for (var i = 0; i < languages.length; ++i) {
    	defaultCoding[languages[i]] = getDefaultCoding(languages[i]);
    }
    return defaultCoding;
}

module.exports.GetDefaultCodingMap = function() {
	return getDefaultCodingMap();
}
module.exports.JavaScriptSandbox = function(javaScriptCoding, problem, req, res) {
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


module.exports.PythonSandbox = function(pythoncoding, problem, req, res) {
	const poolSize = 5;
	var mySandbox = new PythonSandbox({poolSize});

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


module.exports.Compile = function(coding, language, req, res, problem) {
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
            	var runningCodeCommand = "LD_PRELOAD=./EasySandbox/EasySandbox.so " + "./"+ executableFileName;

            	if(language === 'Java') {
            		runningCodeCommand = "cd output; java -Djava.security.manager HelloWorld";
            	}

            	console.log(runningCodeCommand);

            	exec(runningCodeCommand, function(error, stdout,stderr){
            		console.log("running code");
            		if (error) {
            			err.push(stderr);
            			hasError = true;
            		}
            		else {
            			runtime= true;
            			output = stdout;
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