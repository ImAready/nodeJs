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

// users array에 user 추가 (전역변수)
var users = [
    {
        authId: 'local: lcm',
        username: 'lcm',
        password: 'TB4ZaYf0o6gJRDpvNIOzF0qEoNWc8iNE9BO2C3dmUZP8Z9YuglLQwqZQ2Soq8XINOSNjwEIamY1YQl32OVjvSKnasfQ0canEDzo00Kus+xyIr2cXiXxqaVk/BuR3z95QVwxcDwbecVqc00/SXZT3dH/kmQlx0PoAGL8R2MA1s0I=',  // '11111' + salt
        salt: '/K4PnzHaTVSU3SbrgOvkWx0er/y0FOcwDMG/wiTv7whQ+Fjte8AwgJdsm++lkQ4zfPOWWroZwSS1a/Ns6JeseQ==',
        displayName: 'LCM'
    }
];
app.post('/auth/register', (req, res) => {
    hasher({password: req.body.password}, (err, pass, salt, hash) => {
        var user = {
            authId: 'local:' + req.body.username,
            username: req.body.username,
            password: hash,
            salt: salt,
            displayName: req.body.displayName
        };
        users.push(user);
        req.login(user, function (err) { // passport가 생성한 method
            req.session.save(() => {
                res.redirect('/welcome');
            });
        });  
    });
});


// passport - sessions
passport.serializeUser(function (user, done) {
    console.log('serializeUser', user);
    done(null, user.authId);
});

passport.deserializeUser(function (id, done) {
    console.log('deserializeUser', id);
    for (i in users) {
        var user = users[i];
        if(user.authId == id){
            return done(null, user);
        }
    }
    done(null, false);
});
// passport - LocalStrategy
passport.use(new LocalStrategy(
    function(username, password, done) {
        var uname = username;
        var pwd = password;
        for (i in users) {
            var user = users[i];
            if (uname === user.username) {
                return hasher({ password: pwd, salt: user.salt }, (err, pass, salt, hash) => {
                    if (hash === user.password) {
                        console.log('LocalStrategy', user);
                        done(null, user);
                    } else {
                        done(null, false);
                    }
                });
            }
        }
        done(null, false);
    }
));

passport.use(new KakaoStrategy({
    clientID : 'rest ID',
    clientSecret: 'secret ID',
    callbackURL : '/oauth'
    },
    function(accessToken, refreshToken, profile, done){

    console.log(profile);
    var authId = 'kakao:' + profile.id;
    for(i in users){
        var user = users[i];
        if(user.authId === authId){
            return done(null, user);
        }
    }
    var newuser = {
        'authId': authId,
        'displayName': profile.displayName,
        'email': profile._json.kaccount_email,
    };
    console.log('newuser >> '+ newuser);
    users.push(newuser);
    done(null, newuser);
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
    console.log("Connected 3000 port!!");
});