const express = require('express');
const app = express();
const session = require('express-session');

app.use(session({
    secret: '1231임의13415값asdfasdf~#!@',
    resave: false,
    saveUninitialized: true
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

app.listen(3003, function(){
    console.log('Connected 3003 port...');
});