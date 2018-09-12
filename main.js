const express = require('express');
const app = express();

/** 
 * 1. 라우트
var p1 = express.Router();
p1.get('/r1', function(req, res){
    res.send('Hello /p1/r1');
});
p1.get('/r2', function(req, res){
    res.send('Hello /p1/r2');
});
*/

/**
 * 2. 라우트 분리
var p1 = require('./routes/p1')
 */

// 3. 라우트 분리3
var board = require('./routes/board')(app)

app.use('/board', board);






/**
 * 1. 라우트
var p2 = express.Router();
p2.get('/r1', function(req, res){
    res.send('Hello /p2/r1');
});
p2.get('/r2', function(req, res){
    res.send('Hello /p2/r2');
});
 */

 /**
  * 2. 라우트 분리
var p2 = require('./routes/p2')
 */

 //3. 라우트 분리2
var p2 = require('./routes/p2')(app)

app.use('/p2', p2);

app.listen(3003, function(){
    console.log('connected 3003 port...');
});
