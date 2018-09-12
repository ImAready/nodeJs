### Scope

- 어떤 변수들에 접근할 수 있는지를 정의
- 전역 스코프(global scope)와 지역 스코프(local scope)로 나뉜다.







#### 전역 스코프(Global Scope)

- 변수가 함수 바깥이나 중괄호{} 바깥에 선언되었다면 전역 스코프이다.
- 위 설명은 웹 브라우저의 자바스크립트에만 유효. Node.js에서는 전역 스코프를 다르게 정의한다.
- 전역 스포크를 선언하면, 코드 내 모든 곳에서 해당 변수를 사용할 수 있다.

```javascript
const global = 'global scope';

function fnc(){
    console.log(global);
}

console.log(global);  // global scope
fnc();				// global scope
```

- 전역 스코프는 지양하는 것이 좋다. -> 두 개 이상의 변수의 이름이 충돌하는 경우가 생길 수도 있기 때문에
- let 또는 const를 사용하여 선언했다면 충돌이 발생할 때 마다 에러가 발생한다.

```javascript
let thing = 'something';
let thing = 'something else'; // Error, thing has already been declared
```

- 만약 var를 사용하여 선언했다면, 두 번째 변수가 첫 번째 변수를 덮어 쓰게 된다.

```javascript
var thing = 'something';
var thing = 'something else';

console.log(thing);	// something else
```





#### 지역 스코프(Local Scope)

- 특정 부분에서만 사용할 수 있는 변수
- 함수 스코프, 블록 스코프로 나뉜다.

##### 1) 함수 스코프 (Function Scope)

- 함수 내부에 변수를 선언하면, 그 변수는 선언한 함수 내부에서만 접근할 수 있다.

```javascript
function fnc(){
    const hello = 'Hello Javascript';
    console.log(hello);
}

fnc();				// Hello Javascript
console.log(hello); // Error, hello is not defined
```



##### 2) 블록 스코프(Block Scope)

- 중괄호{} 내부에서 const 또는 let 선언을 하면 그 변수는 중괄호 블록 내부에서만 접근할 수 있다.

```javascript
{
    const hello = 'Hello Javascript';
    console.log(hello);    // Hello Javascript
}

console.log(hello);			// Error, hello is not defined
```

- var는 중괄호{} 밖에서 사용 가능. 왜???
- 함수 선언할 때는 중괄호{} 를 사용해야 하므로 블록 스코프는 함수 스코프의 서브셋(subset)이다. (화살표 함수를 사용해서 암시적implicit 반환을 하는 것이 아니라면)



##### 3) 함수 호이스팅(Function hoisting)과 스코프

- 함수가 함수 선언식(Function declaration)으로 선언되면, 현재 스코프 최상단으로 호이스팅(hoist) 된다.

```javascript
// 1
sayHello();
function sayHello(){
    console.log('Hello, javascript');
}

// 2
function sayHello2(){
    console.log('Hello World');
}
sayHello2();
```

- 반면, 함수가 함수 표현식(Function expression)으로 선언되면, 함수를 현재 스코프의 최상단으로 호이스팅 되지 않는다.

```javascript
sayHello();
const sayHello = function(){
    console.log('Hello')
}
```

- 함수 호이스팅은 혼란스러울 수 있기 때문에 사용하지 말고, 미리 선언하는 것이 좋다.





##### 4) 함수는 서로의 스코프에 접근할 수 없다.

- 함수는 각각 선언되었을 때, 서로의 스코프에는 접근할 수 없다.
- 어떤 함수가 다른 함수에서 사용되더라도!!
- 아래 예제에서 second는 변수 firstVariable에 접근할 수 없다.

```javascript
function first(){
    const firstVariable = 'First';
}

function second(){
    first();
    console.log(firstVariable);		//Error, firstVariable is not defined
}
```









##### 5) 네스팅된 스코프 (Nested Scope)

- 함수가 다른 함수 내부에서 정의되었다면, 내부 함수는 외부 함수 변수에 접근할 수 있다.
- 렉시컬 스코핑 (Lexical Scoping)이라고 부른다.
- 하지만, 외부 함수는 내부 함수의 변수에 접근 할 수 없다. 즉, 안에서는 밖을 볼 수 있는데 밖에서는 못봄.

```javascript
function outerFnc(){
    const outer = 'Outer!';
    
    function innerFnc(){
        const inner = 'Inner!';
        console.log(outer);		// Outer!
    }
    
    console.log(inner);		//Error, inner is not defined
}
```







#### 클로저

- 외부함수(포함하고 있는)의 변수에 접근할 수 있는 내부 함수. 스코프 체인으로 표현되기도 한다.
- 세 가지 스코프 체인을 가진다. 1) 클로저 자신에 대한 접근(자신의 블록 내에 정의), 외부 함수의 변수에 대한 접근, 전역 변수에 대한 접근

- 함수 내부에 함수를 작성할 때마다, 클로저를 생성한다.
- 내부에 작성된 함수가 바로 클로저.
- 클로저는 차후 외부 함수의 변수를 사용할 수 있기 때문에 대개 반환하여 사용한다.

```javascript
function outerFnc(){
    const outer = 'Outer!'
    
    function innerFnc(){
        console.log(outer)
    }
    
    return innerFnc
}

outerFnc();		// Outer!
```

- 위에서 내부 함수는 반환되기 때문에, 함수를 선언하자마자 반환되도록 좀 더 짧게 수정할 수 있다.

```javascript
function outerFnc(){
    const outer = 'Outer!';
    
    return function innerFnc(){
        console.log(outer);
    }
}

outerFnc();		//Outer!
```

- 클로저는 외부함수가 리턴된 이후에도 외부함수의 변수에 접근 할 수 있다.
  - 외부 함수가 리턴된 이후에도 여전히 내부함수가 외부함수 변수에 접근하고 있다. 자바스크립트의 함수가 실행되었을 때, 함수는 자신이 생성되었을때와 동일한 스코프 체인을 사용하기 때문에 내부 함수를 나중에  호출할 수 있다.

