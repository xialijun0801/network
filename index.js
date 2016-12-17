
var path = require("path");
var express = require("express");
var app = express();

app.use(express.static(__dirname+'/image'));
app.get("/",function(req,res){
    res.sendFile(path.join(__dirname, "test.html"));
});

app.listen(80);
