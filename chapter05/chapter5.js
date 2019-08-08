/*jshint esversion: 6 */
require('./scripts.js');
function repeat(n, action) {
  for (let i = 0; i < n; i++) {
    action(i);
  }
}

function characterScript(code) {
  for (let script of SCRIPTS) {
    if (script.ranges.some(([from, to]) => {
      return code >= from && code < to;
    })) {
      return script;
    }
  }
  return null;
}

function countBy(items, groupName) {
  let counts = [];
  for (let item of items) {
    let name = groupName(item);
    let known = counts.findIndex(c => c.name == name);
    if (known == -1) {
      counts.push({name, count: 1});
    } else {
      counts[known].count++;
    }
  }
  return counts;
}

function textScripts(text) {
  let scripts = countBy(text, char => {
    let script = characterScript(char.codePointAt(0));
    return script ? script.name : "none";
  }).filter(({name}) => name != "none");

  let total = scripts.reduce((n, {count}) => n + count, 0);
  if (total == 0) return "No scripts found";

  return scripts.map(({name, count}) => {
    return `${Math.round(count * 100 / total)}% ${name}`;
  }).join(", ");
}


function countByCustom(array, groupFunction) {
    let counts = [];
    for (let element of array ) {
        let group = groupFunction(element);
        let index = counts.findIndex( c => c.name === group);
        if (index == -1) {
            counts.push({name: group, count: 1});
        }
        else {
            counts[index].count++;
        }
    }
    return counts;
}

function dominantDirection(string){
    let directionCounts = countByCustom(string, char => {
        let codePoint = char.codePointAt(0);
        let script = characterScript(codePoint);
        return script ? script.direction : "none";
    });
    directionCounts = directionCounts.filter(directionCount => directionCount.name != 'none');

    if (directionCounts.length == 0) return 'ltr';

    let dominantCount = directionCounts.reduce(
        (highestCount, nextCount) =>
            highestCount.count < nextCount.count ? nextCount: highestCount
    );
    return dominantCount.name;
}

let testText = "abc 汉语";

console.log(dominantDirection(testText));

console.log(dominantDirection("Hello!"));
// → ltr
console.log(dominantDirection("Hey, مساء الخير"));
// → rtl
