var Sandbox = require('docker-python-sandbox');
 
const poolSize = 5;
var mySandbox = new Sandbox({poolSize});
 
mySandbox.initialize(err => {
  if (err) throw new Error(`unable to initialize the sandbox: ${err}`);
  
  const code = 'print "Hello, world! I am Python Sandbox"';
  const timeoutMs = 2 * 1000;
  
  mySandbox.run({code, timeoutMs}, (err, result) => {
    if (err) throw new Error(`unable to run the code in the sandbox: ${err}`);
    
    console.log(result.stdout); // Hello, world! 
  })
});
 