const express = require('express');
const app = express();

app.set('view engine', 'jade');
app.set('views', 'jade');

app.get('/view',function(req, res){
    res.render('view');
})
app.get('/add', function(req, res){
    res.render('add');
})

app.listen(3003, function(){
    console.log('Connected 3003 Port...');
})