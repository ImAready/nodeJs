const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.get('/count', function(req, res){
    if(req.cookies.count){
        var count = parseInt(req.cookies.count);
    } else{
        var count = 0;
    }
    count = count + 1
    res.cookie('count', count);
    res.send('Count : ' + count);
});

app.listen(3003, function(){
    console.log('Connected 3003 port...');
});