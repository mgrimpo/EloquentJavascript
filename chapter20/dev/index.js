class DirectoryList {
    constructor(directory,  entries) {
        this.dom = document.querySelector("#dirList");
        this.directory = directory;
        this.entries = entries || [];
    }
    addDirectoryEntry(directoryEntry) {
        this.entries.push(directoryEntry);
        this.dom.appendChild(directoryEntry.dom);
    }
    updateDirectory(directory, entries) {
        this.entries.forEach(entry => this.dom.removeChild(entry));
        this.directory = directory;
        this.entries = entries || [];
        this.entries.forEach(entry => this.addDirectoryEntry(entry));
    }
}

class FileViewer {
    constructor(fileContent){
        this.fileContent = fileContent;
        this.dom = document.querySelector("textarea");
        this.dom.textContent = this.fileContent;
    }
}

class DirectoryEntry {
    constructor(fileName) {
        this.dom = document.createElement("li");
        this.dom.textContent = fileName;
        this.dom.addEventListener("click", (event) => 
            new FileViewer(event.target.textContent));
    }
}
class Controller {
    constructor() {
        this.workingDirectory = "/";
        this.components = {
            directoryList: new DirectoryList(this.workingDirectory),
        };
        this.loadDirectory();
    }
    async loadDirectory(directoryPath){
        directoryPath = directoryPath || this.workingDirectory;
        let response = await fetch(directoryPath);
        let text = await response.text();
        let listItems = text.split("\n").map(fileName => new DirectoryEntry(fileName));
        this.components.directoryList.updateDirectory(directoryPath, listItems);
    }
}

const controller = new Controller();


