/*jshint esversion: 6 */

function range(a, b, step = a < b ? 1 : -1){
    let result = [];
    for (let current = a;  Math.sign(step) * current < Math.sign(step) * b;  current += step) {
        result.push(current);
    }
    return result;
}

function sum(numbers) {
    result = 0;
    for (let number of numbers){
        result += number;
    }
    return result;
}

function reverse(array){
    let result = [];
    for (let i = array.length -1; i >= 0; i--){
        result.push(array[i]);
    }
    return result;
}

function reverseInPlace(array) {
    let l = array.length;
    for (let i = 0; i < Math.floor(l / 2);  i++){
       let temp = array[i];
       array[i] = array[l - 1 - i];
       array[l - 1 - i] = temp;
    }
}

function arrayToList(array) {
    let firstListElement = null;
    let currentListElement = firstListElement;
    for (let arrayElement of array) {
        let nextListElement = {value : arrayElement, rest: null};
        if (currentListElement){
            currentListElement.rest = nextListElement;
        }
        else {
            firstListElement = nextListElement;
        }
        currentListElement = nextListElement;
    }
    return firstListElement;
}

function arrayToListBetter(array) {
    let list = null;
    for (let i = array.length - 1; i >= 0; i--){
        list = {value: array[i], rest: list};
    }
    return list;
}

function listToArray(list){
    let array = [];
    for (let node = list; node !== null; node = node.rest) {
        array.push(node.value);
    }
    return array;
}

function prepend(listElement, inputList) {
   listElement.rest = inputList;
   return listElement;
}

function nth(list, n) {
    result = list;
    for (i = 1; i < n + 1; i++) {
        if(result){
            result = result.rest;
        }
        else {
            return undefined;
        }
    }
    return result == null ? undefined: result;
}

function nthRec(list, n){
    if (list == null) {
        return undefined;
    }
    if (n == 0) {
        return list;
    }
    return nthRec(list.rest, n - 1);
}


function deepEqual(a, b) {
    if (a === b)  return true;

    let aType = typeof a, bType = typeof b;
    if (a ==null || aType !== 'object' || b == null ||
        bType !== 'object' ) return false;

    let aKeys = Object.keys(a), bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;

    for (let property of Object.keys(a)) {
        if ( !(property in b) || !deepEqual(a[property], b[property])) {
            return false;
        }
    }

    return true;
}

let numberArray = range(1,3);
let list1 = arrayToList(numberArray);
let list2 = arrayToList(numberArray);
//list2 = prepend({value:"erster, lol"}, list2);
console.log(JSON.stringify(list1));
let isEqual = deepEqual(list1, list2);
console.log(isEqual);
console.log(deepEqual(null, list1));
