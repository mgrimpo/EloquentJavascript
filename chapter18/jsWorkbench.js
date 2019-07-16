document.querySelector("#run").addEventListener("click", () => {
    let sourceCode = document.querySelector("#source").value;
    let resultPlaceholder = document.querySelector("#result");
    try {
        let result = new Function(sourceCode)();
        resultPlaceholder.textContent = result;
    }
    catch(e) {
       resultPlaceholder.textContent = "Error: "  + e;
    }
});
