/**
 * 2. 라우트 분리
var express = require('express');
var route = express.Router();

route.get('/r1', function(req, res){
    res.send('Hello /p2/r1');
});

route.get('/r2', function(req, res){
    res.send('Hello /p2/r2');
});

module.exports = route;
 */


 // 3. 라우트 분리2
 module.exports = function(app){
    var express = require('express');
    var route = express.Router();
    
    route.get('/r1', function(req, res){
        res.send('Hello /p2/r1');
    });
    
    route.get('/r2', function(req, res){
        res.send('Hello /p2/r2');
    });

    return route;
 };