/*jshint esversion: 6 */

class Group {
    //TODO Try removing parentheses
    constructor() {
        this.__groupArray__ = [];
    }

    add(value) {
        if (!this.has(value)) this.__groupArray__.push(value);
    }

    has(value) {
        return this.__groupArray__.indexOf(value) != -1;
    }

    delete(value) {
        let index =  this.__groupArray__.indexOf(value);
        if(index != -1) {
            this.__groupArray__.splice(index, 1);
        }
    }

    static from(iterable) {
        let newGroup = new Group();
        for (let element of iterable) {
            newGroup.add(element);
        }
        return newGroup;
    }

    [Symbol.iterator]() {
        return new GroupIterator(this);
    }

}
class GroupIterator  {
    constructor(group) {
        this.index = 0;
        this.group = group;
    }
    next() {
        if (this.index >= this.group.__groupArray__.length){
            return { done: true};
        }
        let result = {value: this.group.__groupArray__[this.index],
            done: false};
        this.index++;
        return result;
    }
}


let group = Group.from([10, 20]);
console.log(group.__groupArray__);
console.log(group.has(10));
// → true
console.log(group.has(30));
// → false
group.add(10);
group.delete(10);
console.log(group.has(10));
// → false

for (let value of Group.from(["a", "b", "c"])) {
    console.log(value);
}
// → a
// → b
// → c
