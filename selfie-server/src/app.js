var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
// var csrf = require('csurf');
var passport = require('passport');
var logger = require('morgan');
const cors = require('cors');


// loading environment variables
require('dotenv').config();

const PORT = process.env.PORT || 3000;

console.log('app.js starts...');
var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(cors());

app.locals.pluralize = require('pluralize');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
// app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: true })); // Ensure session middleware is configured before CSRF
// app.use(csrf()); // CSRF middleware after session middleware
// app.use(passport.authenticate('session'));
// app.use(function(req, res, next) {
//   var msgs = req.session.messages || [];
//   res.locals.messages = msgs;
//   res.locals.hasMessages = !! msgs.length;
//   req.session.messages = [];
//   next();
// });
// app.use(function(req, res, next) {
//   res.locals.csrfToken = req.csrfToken();
//   next();
// });

console.log('app.js: initialize routes');
app.use('/', indexRouter);
app.use('/', authRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

console.log('app.js: end config...');

app.listen(PORT, function() {
  console.log('Server listening on port 3000');
});
