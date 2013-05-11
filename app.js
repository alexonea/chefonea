
/**
 * Module dependencies.
 */

var express = require('express')
  , passport = require('passport')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var FacebookStrategy = require('passport-facebook').Strategy;


routes.forum = require('./routes/forum');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.favicon('favicon.png'));
app.use(express.static(path.join(__dirname, 'public')));

console.log(process.env.FACEBOOK_APP_ID);
console.log(process.env.FACEBOOK_APP_SECRET);
console.log(process.env.CALLBACK_URL);

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.CALLBACK_URL
  },
  function (accessToken, refreshToken, profile, done) {
    var Database = require('lib/database.js');
    var db = new Database();

    db.findUser(profile.id, function (err, user) {
      if (err) { return done(err); }
      if (user.length === 0) {
        db.addUser(profile, function () {
          var result = new Object();
          result.id = profile.id;
          done(null, result);
        });
      } else
        done(null, user[0]);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/forum', routes.forum);

app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/' }));

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
