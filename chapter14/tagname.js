function byTagName1(node, tagName) {
    tagName = tagName.toLowerCase();
    let matches = [];
    for (let i = 0; i < node.childNodes.length; i++) {
        let child = node.childNodes[i];
        matches = matches.concat(byTagName(child, tagName));
        if (child.nodeName.toLowerCase() == tagName) {
            matches.push(child);
        }
    }
    return matches;
}

function byTagName(node, tagName) {
    tagName = tagName.toUpperCase();
    let matches = [];
    function search(node) {
        for (let i = 0; i < node.childNodes.length; i++){
            let child = node.childNodes[i];
            if (child.nodeType == Node.ELEMENT_NODE){
                search(child);
                if (child.nodeName == tagName) matches.push(child);
            }
        }
    }
    search(node);
    return matches;
}

console.log(byTagName(document.body, "h1").length);
// → 1
console.log(byTagName(document.body, "span").length);
// → 3
let para = document.querySelector("p");
console.log(byTagName(para, "span").length);
  // → 2