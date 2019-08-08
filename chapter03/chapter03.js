/*jshint esversion: 6 */
function findSequence(target){
    function findSequenceHelper(current, history) {
        if (current === target) {
            return history;
        }
        if (current > target) {
            return null;
        }
        return findSequenceHelper(current + 5, history + " -> +5") ||
               findSequenceHelper(current * 3, history + " -> *3");
    }

    return findSequenceHelper(1, "");
}

// Exercises

function isEven(integer){
    if (integer === 0) {
        return true;
    }
    if (integer === 1) {
        return false;
    }
    let subtrahend;
    if (integer > 0){
        subtrahend = 2;
    }
    else {
        subtrahend = -2;
    }
    return isEven(integer - subtrahend);
}

function countBs(string) {
    return countChar(string, "B");
}

function countChar(string, char){
    let counter = 0;
    for (let i = 0; i < string.length; i++){
        if (string[i] === char) {
            counter++;
        }
    }
    return counter;
}

console.log(countBs("BBBBaB"));
console.log(countChar("BBBBaB", "a"));
console.log(countChar("CCCBC", "C"));

