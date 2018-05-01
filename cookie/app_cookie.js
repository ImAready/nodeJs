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

/*
cart = {
    제품 아이디 : 제품 수량
}
*/
app.get('/cart/:id', function(req, res){
    var id = req.params.id;
    // res.send('Hi'+id);
    if(req.cookies.cart){ //cookie가 있을 때
        var cart = req.cookies.cart;
    } else {
        var cart = {};
    }

    if(!cart[id]){ // 새로운 제품이면 0으로 초기화
        cart[id] = 0;
    } 
    cart[id] = parseInt(cart[id]) + 1; //cookie return string 
    res.cookie('cart', cart);
    // res.send(cart);
    res.redirect('/cart');
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