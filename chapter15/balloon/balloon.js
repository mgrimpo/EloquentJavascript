window.onload  = () => {
    let para = document.querySelector("p");
    let maxSize = 200;

    function cutPx(string) { return string.slice(0, string.length - 2) }

    function scaleFontSize(element, factor) {
        let original = window.getComputedStyle(element, null).getPropertyValue("font-size");
        element.style.fontSize = Number(cutPx(original)) * factor + "px";
    }

    function handleKeyDown( event  ) {
        if (event.key == "ArrowDown") {
            scaleFontSize(para, 0.9);
            event.preventDefault();
        }
        else if(event.key == "ArrowUp") {
            scaleFontSize(para, 1.1);
            if(cutPx(para.style.fontSize) > maxSize) {
                para.textContent = "💥";
                window.removeEventListener("keydown", handleKeyDown);
            }
            event.preventDefault();
        }
    }

    window.addEventListener("keydown", handleKeyDown);
};
