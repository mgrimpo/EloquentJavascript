/* jshint esversion: 6 */
"use strict";

class MultiplicatorUnitFailure extends Error {}

function primitiveMultiply(factor1, factor2) {
    if (Math.random() < 0.2) {
        return factor1 * factor2;
    }
    throw new MultiplicatorUnitFailure("Couldn't multiply");
}

function reliableMultiply(factor1, factor2) {
    for (;;) {
        try {
             return primitiveMultiply(factor1, factor2);
        }
        catch(e) {
            if (! (e instanceof MultiplicatorUnitFailure)) throw e;
        }
    }
}
console.log(reliableMultiply(8,8));

const box = {
    locked: true,
    unlock() { this.locked = false; },
    lock() { this.locked = true; },
    _content: [],
    get content() {
        if (this.locked) throw new Error("Locked!");
        return this._content;
    }
};

function withBoxUnlocked(body) {
    let wasLocked = box.locked;
    box.unlock();
    try {
        body();
    }
    catch (e) {
        e.stack;
    }
    finally{
        if (wasLocked) box.lock() ; 
    }
}

withBoxUnlocked(function () {
    box.content.push("gold piece");
});

try {
    withBoxUnlocked(function () {
        throw new Error("Pirates on the horizon! Abort!");
    });
} catch (e) {
    console.log("Error raised:", e);
}
console.log(box.locked);
  // → true