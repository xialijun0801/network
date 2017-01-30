
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
var cookieSession = require('cookie-session');

var index = require('./routes/index');
var userRoutes = require('./routes/user');

var app = express();


var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost', function(err) {
	if(err) {
		console.log(err);
	}
	else {
		console.log('Connected to the database');
	}
});
var db = mongoose.connection;

require('./config/passport');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['mysecret'],
  // Cookie Options 
  maxAge: 24 * 60 * 60 * 1000 // 24 hours 
}));

app.use(session({
  secret: 'mysecret', 
  resave: false, 
  saveUninitialized: false, 
  cookie: { secure: true, maxAge: 24 * 60 * 60 * 1000}}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next){
	res.locals.login = req.isAuthenticated();
	next();
});

app.use('/user', userRoutes);
app.use('/', index);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(80, function(err) {
   if(err){
       console.log(err); 
   } else {
       console.log("Listening on port 80");  
   }
});

