function _sum(a, b){
    return a + b;
}
module.exports = function(a, b){ //인터페이스
    return _sum(a,b);
};
