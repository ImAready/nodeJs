var sum = require('./lib/sum');
// require가 module.exports의 값인 함수로 치환됨. 
console.log('sum : ',sum(1, 2));

var calculator = require('./lib/calculator');
console.log('cal sum : ',calculator.sum(1,2));
console.log('cal avg : ',calculator.avg(1,2));