const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
app.use(cookieParser());

var products = {
    1:{title:'The history of web 1'},
    2:{title:'The next web'}
};
app.get('/products', function(req, res){
    // res.send('Products');
    var output = '';
    for(var name in products){
        console.log(products[name].title);
        // console.log(name.title);
        output += `
            <li>
                <a href="/cart/${name}">${products[name].title}</a>
            </li>
        `
    }
    res.send(`<h1>Products</h1><ul>${output}</ul><a href="/cart">Cart</a>`);
});

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