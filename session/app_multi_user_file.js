const express = require('express');
const app = express();
const session = require('express-session'); 
const bodyParser = require('body-parser');
//session을 file에 저장
const fileStore = require('session-file-store')(session); // express-session과 의존관계 ->인자로 넘겨줌
//암호화. 더이상 안씀
const md5 = require('md5');

app.use(bodyParser.urlencoded({ extended : false }));
app.use(session({
    secret: '1231임의13415값asdfasdf~#!@',
    resave: false,
    saveUninitialized: true,
    store: new fileStore() //사용자의 session data를 파일에 저장.
}));

app.get('/count', function(req, res){
    // req.session.count = 1;
    // res.send('Hi');
    if(req.session.count) {
        req.session.count++;
    } else {
        req.session.count = 1;
    }
    res.send('count : '+req.session.count);
});

app.get('/temp', function(req, res){
    res.send('result : '+req.session.count)
});

app.get('/auth/login', function(req, res){
    var output = '';
    output = `
    <h1>Login</h1>
        <form action="/auth/login" method="post">
            <p>
                <input type="text" name="username" placeholder="username">
            </p>
            <p>
                <input type="text" name="password" placeholder="password">
            </p>
            <p>
                <input type="submit">
            </p>
        </form>
    `;
    
    res.send(output);
});
app.post('/auth/login', function(req, res){
    
    var uname = req.body.username;
    var pwd = req.body.password;

    for(var i = 0 ; i <users.length; i++){
        var user = users[i]
        if(uname === user.username && md5(pwd) === user.password){
            req.session.displayName = user.displayName;
            return req.session.save(function(){ //session이 안전하게 저장한 후에
                res.redirect('/welcome');
            });
        }      
    }
    res.send('Who are you? <a href="/auth/login">login</a>');

});

app.get('/welcome', function(req, res){
    if(req.session.displayName) {
      res.send(`
        <h1>Hello, ${req.session.displayName}</h1>
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

app.get('/auth/register', function(req, res){
    var output = '';
    output = `
    <h1>Register</h1>
        <form action="/auth/register" method="post">
            <p>
                <input type="text" name="username" placeholder="username">
            </p>
            <p>
                <input type="text" name="password" placeholder="password">
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

// 임의의 기본 사용자
var users=[
    {
        username:'hello',
        password:'b59c67bf196a4758191e42f76670ceba',
        displayName:'Master'
    }
];
app.post('/auth/register', function(req, res){
    var user = {
        username: req.body.username,
        password: req.body.password,
        displayName: req.body.displayName
    };
    users.push(user);
    req.session.displayName = req.body.displayName; //회원가입하면 바로 세션 로그인
    req.session.save(function(){
        res.redirect('/welcome');
    })
});

app.get('/auth/logout', function(req, res){
    delete req.session.displayName;
    res.redirect('/welcome');
});

app.listen(3003, function(){
    console.log('Connected 3003 port...');
});