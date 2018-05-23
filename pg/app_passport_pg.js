const express = require('express');
const app = express();
const session = require('express-session'); 
const fileStore = require('session-file-store')(session); 
const bodyParser = require('body-parser');
//session을 file에 저장
const pg = require('pg')
const Pool = require('pg-pool')
const pgStore = require('connect-pg-simple')(session)
//암호화
const bkfd2Password = require("pbkdf2-password");
const hasher = bkfd2Password();
const passport = require('passport');
//소셜 인증
const LocalStrategy = require('passport-local').Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;

app.use(bodyParser.urlencoded({ extended: false }));

const pgPool = new Pool({
    database: 'o2',
    user: 'postgres',
    password: '1111',
    port: 5432
});
// pg connected
const conn = new pg.Client({
  database: 'o2',
  user: 'postgres',
  password: '1111',
  port: 5432
});
conn.connect();

app.use(session({
    secret: '1231임의13415값asdfasdf~#!@',
    resave: false,
    saveUninitialized: true,
    store: new pgStore({
        pool: pgPool
    })
}));
// passport 
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/logout', (req, res) => {
    req.logout();
    req.session.save(function(){
        res.redirect('/welcome');
    });
});

app.get('/welcome', (req, res) => { 
    if(req.user && req.user.displayName) {  // passport에 의해 session에 user라는 객체가 생김
        res.send(`
            <h1>Hello, ${req.user.displayName}</h1>
            <a href="/auth/logout">logout</a>
        `);
    } else {
        res.send(`
          <h1>Welcome</h1>
          <ul>
            <li><a href="/auth/login">Login</a></li>
            <li><a href="/auth/register">Register</a></li>
          </ul>
        `);
    }
});

app.get('/auth/register', (req, res) => {
    var output = `
        <h1>Register</h1>
        <form action="/auth/register" method="post">
            <p>
                <input type="text" name="username" placeholder="username">
            </p>
            <p>
                <input type="password" name="password" placeholder="password">
            </p>
            <p>
                <input type="text" name="displayName" placeholder="displayName">
            </p>
            <p>
                <input type="submit">
            </p>
        </form>
    `;
    res.send(output);
});

app.post('/auth/register', (req, res) => {
    hasher({password: req.body.password}, (err, pass, salt, hash) => {
        var user = {
            authid: 'local:' + req.body.username,
            username: req.body.username,
            password: hash,
            salt: salt,
            displayName: req.body.displayName,
            email : ''
        };

        var sql = `INSERT INTO usrts (authid, username, password, salt, displayname, email) 
        VALUES ($1, $2, $3, $4, $5, $6)`;
        conn.query(sql,  [user.authid, user.username, 
          user.password, user.salt, 
          user.displayname, user.email], function(err, results){
          if(err){
            console.log(err);
            res.status(500);
          } else {
            req.login(user, function(err){
              req.session.save(function(){
                res.redirect('/welcome');
              });
            });
          }
        });
        // users.push(user);
        // req.login(user, function (err) { // passport가 생성한 method
        //     req.session.save(() => {
        //         res.redirect('/welcome');
        //     });
        // });  
    });
});


// passport - sessions
passport.serializeUser(function (user, done) {
    console.log('serializeUser>>>>>>>>>>', user);
    done(null, user.authid);
});

passport.deserializeUser(function (id, done) {
    console.log('deserializeUser>>>>>>>>>', id);
    var sql = `SELECT * FROM usrts WHERE authid = $1`;
    conn.query(sql, [id], function(err, results){
      //console.log(sql, err, results);
      if(err){
        console.log(err)
        done('Threr is no user.');
      } else {
        done(null, results.rows[0]);
      }
    });
    // for (i in users) {
    //     var user = users[i];
    //     if(user.authId == id){
    //         return done(null, user);
    //     }
    // }
    // done(null, false);
});
// passport - LocalStrategy
passport.use(new LocalStrategy(
    function(username, password, done) {
        var uname = username;
        var pwd = password;

        var sql = `SELECT * FROM usrts WHERE authid = $1`;
        conn.query(sql, ['local:'+uname], function(err, results){
          console.log(results.rows[0]);
          if(err){
            return done('There is no user.');
          }
          var user = results.rows[0];
          return hasher({ password: pwd, salt: user.salt }, (err, pass, salt, hash) => {
              if (hash === user.password) {
                  console.log('LocalStrategy', user);
                  done(null, user);
              } else {
                  done(null, false);
              }
          });
        })
        // for (i in users) {
        //     var user = users[i];
        //     if (uname === user.username) {
        //         return hasher({ password: pwd, salt: user.salt }, (err, pass, salt, hash) => {
        //             if (hash === user.password) {
        //                 console.log('LocalStrategy', user);
        //                 done(null, user);
        //             } else {
        //                 done(null, false);
        //             }
        //         });
        //     }
        // }
        // done(null, false);
    }
));

passport.use(new KakaoStrategy({
    clientID : 'rest id',
    clientSecret: 'secret id',
    callbackURL : '/oauth'
    },
    function(accessToken, refreshToken, profile, done){

    console.log(profile);
    var authId = 'kakao:' + profile.id;
    var sql = `SELECT * FROM usrts WHERE authid = $1`;
    conn.query(sql, [authId], function(err, results){
        if(results.length > 0){
            done(null, reaults.rows[0]);
        } else {
            var newuser = {
                'authId': authId,
                'displayName': profile.displayName,
                'email': profile._json.kaccount_email,
            };
            var sql = `INSERT INTO usrts (authid, displayname, email) 
                    VALUES ($1, $2, $3)`;
            conn.query(sql, [newuser.authid, newuser.displayname, newuser.email], (err, result) => {
                if(err){
                    console.log(err);
                    done('ERROR');
                } else{
                    done(null, newuser);
                }
            });
        }
    });
    }
));

// LocalStrategy
app.post('/auth/login', 
          passport.authenticate('local', { successRedirect: '/welcome',
                                           failureRedirect: '/auth/login',
                                           failureFlash: false}));

// KakaoStrategy   
app.get('/auth/kakao', passport.authenticate('kakao',{ successRedirect: '/welcome',
                                                       failureRedirect: '/auth/login',
                                                     }));

app.get('/oauth', passport.authenticate('kakao', { successRedirect: '/welcome',
                                                   failureRedirect: '/auth/login'}));

app.get('/auth/login', (req, res) => {
    var output = `
        <h1>Login</h1>
        <form action="/auth/login" method="post">
            <p>
                <input type="text" name="username" placeholder="username">
            </p>
            <p>
                <input type="password" name="password" placeholder="password">
            </p>
            <p>
                <input type="submit">
            </p>
        </form>
        <a href="/auth/kakao">kakao</a>
    `;

    res.send(output);
});

app.get('/count', (req, res) => {
    if(req.session.count) {
        req.session.count++;  
    } else {
        req.session.count = 1;
    } 
    res.send('count : '+req.session.count);
});

app.listen(3003, function(){
    console.log("Connected 3003 port!!");
});