/* jshint esversion: 6*/
let text = "'I'm the cook,' he said, 'it's my job.'";
// Change this call.
let regex = /(^|[.,;: ])'(.*?[.,;])'/g;
console.log(text.match(regex));
console.log(text.replace(regex, "\"$2\""));
// → "I'm the cook," he said, "it's my job."