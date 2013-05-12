
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
routes.logout = require('./routes/logout');
routes.sync = require('./routes/sync');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser()); 
app.use(express.session({secret: 'am_sarmale'}));
app.use(passport.initialize());
app.use(app.router);
app.use(express.favicon('favicon.png'));
app.use(express.static(path.join(__dirname, 'public')));

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID.toString().trim(),
  clientSecret: process.env.FACEBOOK_APP_SECRET.toString().trim(),
  callbackURL: process.env.CALLBACK_URL.toString().trim(),
  profileFields: ['id', 'displayName', 'photos', 'email'],
  },
  function (accessToken, refreshToken, profile, done) {

    process.nextTick(function () {
      var Database = require('./lib/database.js');
      var db = new Database();

      var result = new Object();
      result.id = profile.id;
      result.name = profile.displayName;
      result.email = profile.email;
      result.photo = profile.photos[0].value;

      db.findUser(profile.id, function (err, user) {
        if (err) { return done(err); }
        if (user.length === 0) {
          db.addUser(result, function () {
            done(null, result);
          });
        } else
          done(null, result);
      });
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

app.get('/logout', routes.logout);

app.post('/sync', routes.sync);

var restrict = function(req, res, next){
    if (!req.session.passport.user) {
        req.session.redirect_to = '/';
        res.redirect('/login');
    } else {
        next();
    }
};

app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'read_stream' }));
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/' }));

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
