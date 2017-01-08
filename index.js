
var path = require("path");
var express = require("express");
var app = express();
//var morgan = require('morgan')

//app.use(morgan('combined'))
app.use(express.static(__dirname+'/image'));

app.get("/",function(req,res){
    res.sendFile(path.join(__dirname, "test.html"));
});

app.listen(80, function(err) {
   if(err){
       console.log(err); 
   } else {
       console.log("Listening on port 80");  
   }
});
