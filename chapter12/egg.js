
function parse(program){
    let {expr, rest} = parseExpression(program);
    if (skipSpace(rest)) throw new SyntaxError("Invalid program");
    return expr;
}

function parseExpression(program) {
    program = skipSpace(program);
    let expr, match;
    if (match = /^"([^"]*)"/.exec(program)) {
        expr = { type: "value", value: match[1] };
    }
    else if (match = /^\d+\b/.exec(program)) {
        expr = { type: "value", value: Number(match[0]) };
    }
    else if (match = /^[^\s(),#]+/.exec(program)) {
        expr = { type: "word", name: match[0] };
    }
    else {
        throw new SyntaxError("Unexpected Syntax:\n" + program);
    }
    return parseApply(expr, program.slice(match[0].length));
}

function parseApply(expr, program) {
    program = skipSpace(program);
    if(program[0] != "("){
        return {expr: expr, rest:program};
    }
    program = skipSpace(program.slice(1));
    expr = {type: "apply", operator: expr, args: []};
    while (program[0] != ")"){
        let arg = parseExpression(program);
        expr.args.push(arg.expr);
        program = skipSpace(arg.rest);
        if (program[0] == ","){
            program = skipSpace(program.slice(1));
        }
        else if (program[0] != ")"){
            throw new SyntaxError("Expected ',' or ')'")
        }
    }
    return parseApply(expr, program.slice(1));
}

const specialForms = Object.create(null);
specialForms.if = (args, scope) => {
    if(args.length != 3) {
        throw new SyntaxError("Invalid number of arguments");
    }
    else if (evaluate(args[0], scope)) {
        return evaluate(args[1], scope);
    }
    else {
        return evaluate(args[2], scope);
    }
};

specialForms.while = (args, scope) => {
    if (args.length != 2) {
        throw new SyntaxError("Invalid nuber of arguments");
    }
    else {
        while (evaluate(args[0], scope)){
            evaluate(args[1], scope);
        }
    }
    return false;
};

specialForms.define = (args, scope) => {
    if(args.length != 2 || args[0].type != "word") {
        throw new SyntaxError("Invlaid Use of define");
    }
    let value = evaluate(args[1], scope);
    scope[args[0].name] = value;
    return value;
};

specialForms.do = (args, scope) => {
    let value = false
    for (let arg of args) {
        value = evaluate(arg, scope);
    }
    return value;
};

specialForms.fun = (args, scope) => {
    if (!args.length) {
        throw new SyntaxError("Functions must have a body");
    }
    let body = args[args.length-1];
    let params = args.slice(0, args.length -1).map( expr => {
        if (expr.type != "word") {
            throw new SyntaxError("Parameters must be words");
        }
        return expr.name;
    });
    return function() {
        if(arguments.length != params.length) {
            throw new TypeError("Wrong number of arguments");
        }
        let localScope = Object.create(scope);
        for(let i = 0; i < arguments.length; i++){
            localScope[params[i]] = arguments[i];
        }
        return evaluate(body, localScope);
    }
}

function evaluate(expr, scope) {
   if (expr.type == "value") {
       return expr.value;
   } 
   else if (expr.type == "word"){
        if (expr.name in scope){
            return scope[expr.name];
        }
        else {
            throw new ReferenceError("Undefined binding " + expr.name);
        }
   }
   else if (expr.type == "apply") {
       let {operator, args} = expr;
       if (operator.type == "word" && operator.name in specialForms) {
           return specialForms[operator.name](expr.args, scope);
       }
       else {
           let op = evaluate(operator, scope);
           if (typeof op == "function") {
               return op(...args.map(arg => evaluate(arg, scope)));
           }
           else {
               throw new TypeError("Applying non function " + operator.name);
           }
       }
   }
}

function skipSpace(string){
    let skippable = (/^((#.*)|\s)*/).exec(string);
    return string.slice(skippable[0].length);
}
const topScope = Object.create(null);
topScope.true = true;
topScope.false = false;
for ( let op of ["+", "-", "*", "/", "%", "==", "<", ">"]){
    topScope[op] = new Function("a"," b", `return a ${op} b;`);
}
topScope.print = value => {
    console.log(value);
    return value;
};

specialForms.set = (args,scope) => {
    if(args.length != 2 || args[0].type != "word") {
        throw new SyntaxError("Invalid arguments for set");
    }
    let word = args[0];
    let hasOwn = (scope, name) => Object.prototype.hasOwnProperty.call(scope, name);
    for(let currentScope = scope; currentScope ; currentScope = Object.getPrototypeOf(currentScope)) {
        if (hasOwn(currentScope, word.name)) {
            return currentScope[word.name] = evaluate(args[1], scope);
        }
    }
    throw new ReferenceError(`Setting undefined variable ${word.name}`);
};

topScope.array = (...values) =>  values;

topScope.length = array =>  array.length; 

topScope.element = (array, i) =>  array[i];

function run(program) {
    return evaluate(parse(program), topScope);
}



// console.log(JSON.stringify(parse(`
// do(define(f, fun(a, fun(b, +(a, b)))),
//    print(f(4)(5)))
// `),null, 4));

run(`
do(define(x, 4),
   define(setx, fun(val, set(x, val))),
   setx(50),
   print(x))
`);


console.log(parse("# hello\nx"));
// → {type: "word", name: "x"}

console.log(parse("a # one\n   # two\n()"));