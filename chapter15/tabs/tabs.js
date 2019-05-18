function asTabs(node) {
    let buttons = [];
    for (let tab of node.children) {
        tab.style.display = "none";
        let button = document.createElement("button");
        button.textContent = tab.getAttribute("data-tabname");
        button.addEventListener("click", event => switchTo(tab, event.target));
        buttons.push(button);
    }
    let listItems = buttons.map(button => document.createElement("li").appendChild(button).parentNode);
    let ul = document.createElement("ul");
    listItems.forEach(li => ul.appendChild(li));
    node.insertBefore(ul, node.firstChild);
    switchTo(node.children[1], buttons[0]);
}

function switchTo(tab, button) {
    if (active.tab) {
        active.tab.style.display = "none";
        active.button.classList.remove("active");
    }
    active.tab = tab;
    active.button = button;
    button.classList.add("active");
    tab.style.display = "block";
}
let active = {}; 
asTabs(document.querySelector("tab-panel"));