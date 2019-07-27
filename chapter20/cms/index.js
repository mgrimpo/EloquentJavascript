class DirectoryList {
    constructor(directory, entries) {
        this.dom = document.querySelector("#dirList");
        this.domLabel = document.querySelector("#directoryLabel");
        this.directory = directory;
        this.entries = entries;
    }

    _clear() { while (this.dom.firstChild) this.dom.removeChild(this.dom.firstChild) }

    async render() {
        this._clear();
        let directoryEntries = this.entries.map(
            entry => new DirectoryEntry(entry)
        );
        directoryEntries.forEach(entry => this.dom.appendChild(entry.dom));
        this.domLabel.textContent = `"${this.directory}" `;
    }

    updateViewModel(directory = this.directory, entries = this.entries) {
        this.directory = directory;
        this.entries = entries;
    }
}

class FileViewer {
    constructor() {
        this.dom = document.querySelector("#fileViewer");
        this.fileName = undefined;
        this.fileContent = undefined;
        this._hide(true);
    }
    updateViewModel(fileName, fileContent) {
        this.fileName = fileName;
        this.fileContent = fileContent;
    }
    _hide(bool) {
        let displayStyle = bool ? "none" : "block";
        this.dom.style.display = displayStyle;
    }
    render() {
        console.log(this.fileContent);
        this.dom.value = this.fileContent;
        this._hide(false);
    }
}

class DirectoryEntry {
    constructor({ entryName, entryType }) {
        this.entryName = entryName;
        this.entryType = entryType;
        this.dom = document.createElement("li");
        this.dom.classList.add("tile");
        this.render();
        this.dom.addEventListener("click", (domEvent) =>
            this.onClick(this._mapToControllerEvent(domEvent))
        );
    }
    render() {
        if (this.entryType && this.entryType == "directory") {
            this.dom.classList.remove("has-text-black");
            this.dom.classList.add("has-text-link");
        }
        else {
            this.dom.classList.add("has-text-black");
        }
        this.dom.textContent = this.entryName;
    }

    setEntryType(entryType) {
        this.entryType = entryType;
    }
    _mapToControllerEvent(domEvent) {
        let controllerEvent = { entryName: this.entryName, entryType: this.entryType };
        return controllerEvent;
    }
}
// Paceholder for injected method
DirectoryEntry.prototype.onClick = () => console.log("Method stub called, method injection failed");

class Model {
    constructor() {
        this.currentDirectory = "/";
        this.directoryContent = [];
        this.currentFileName = undefined;
        this.currentFileContent = undefined;
        this.loadDirectory();
    }
    async loadDirectory() {
        fetch(this.currentDirectory).then(response =>
            response.text().then(text => {
                let entryNames = text ? text.split("\n") : []; 
                console.log(text);
                this.directoryContent = entryNames.map(entryName => ({ entryName, entryType: undefined }));
                if (this.currentDirectory !== this.baseDirectory)
                    this.directoryContent.unshift({ entryName: "..", entryType: "directory" });
                this.determineEntryTypes();
                this.notifyChanged({ directoryContent: this.directoryContent });
            }));
    }

    //TODO:
    async determineEntryTypes() {
        let directoryAmongEntries = false;
        let directoryContentWithTypes = await Promise.all(
            this.directoryContent.map(async ({ entryName }) => {
                console.log(entryName);
                let response = await fetch(
                    this.getFullPath(entryName),
                    { method: "MKCOL" }
                );
                let statusCode = await response.status;
                let entryType;
                if (statusCode == 204 || entryName == "..") {
                    entryType = "directory";
                    directoryAmongEntries = true;
                }
                else {
                    entryType = "file";
                }
                return { entryName, entryType }
            }));
        if (directoryAmongEntries)
            this.update({ directoryContent: directoryContentWithTypes });
            // this.notifyChanged({ directoryContent: this.directoryContent });
    }

    async switchToDirectory(relativePath) {
        relativePath += relativePath.endsWith("/") ? "" : "/";
        //TODO: Insert handling for .. to avoid growing path
        let fullPath = this.getFullPath(relativePath);
        this.update({ currentDirectory: fullPath });
    }
    getFullPath(relativePath) {
        let basePath = this.currentDirectory;
        if (relativePath.startsWith("..")) {
            let lastDirectoryInPathIndex = basePath.lastIndexOf("/", basePath.length - 2);
            basePath = basePath.slice(0, lastDirectoryInPathIndex);
            relativePath = relativePath.slice(2);
        }
        console.log(`basepath: ${basePath} relaPath: ${relativePath}`)
        return basePath + relativePath;
    }

    update(newModelValues) {
        let keys = Object.keys(newModelValues);
        keys.forEach(key => {
            if (key in this) this[key] = newModelValues[key];
            if (key == "currentDirectory") {
                this.loadDirectory()
            }
            if (key == "currentFileName") {
                this.loadFile();
            }
            if (key == "directoryContent") {
                let sortedContent = newModelValues.directoryContent
                    .sort((entry1, entry2) => entry1.entryName > entry2.entryName);
                newModelValues.directoryContent =sortedContent;
                this.directoryContent = sortedContent;
            }
        });
        this.notifyChanged(newModelValues);
    }
    async loadFile() {
        let path = this.currentDirectory + this.currentFileName;
        if (!path) return;
        fetch(path).then(response =>
            response.text().then(text => {
                this.currentFileContent = text;
                console.log(this.currentFileContent);
                this.notifyChanged({ currentFileContent: this.currentFileContent });
            })
        );
    }
}
//Method stub to be injected with callback
Model.prototype.notifyChanged = () => { console.log("notifyChanged called before injection") };
Model.prototype.baseDirectory = "/";

class Controller {
    constructor(model) {
        this._injectViewListeners();
        this._injectModelListeners();
        this.components = {
            directoryList: new DirectoryList(),
            fileViewer: new FileViewer()
        };
        this.model = model;
    }
    _injectViewListeners() {
        DirectoryEntry.prototype.onClick = this._directoryEntryOnClick.bind(this);
    }
    _injectModelListeners() {
        Model.prototype.notifyChanged = this._onModelChange.bind(this);
    }
    _onModelChange(newModelValues) {
        if ("directoryContent" in newModelValues) {
            this.components.directoryList.updateViewModel(
                this.model.currentDirectory, this.model.directoryContent);
            this.components.directoryList.render();
        }
        if ("currentFileContent" in newModelValues) {
            this.components.fileViewer.updateViewModel(
                this.model.currentFileName, this.model.currentFileContent);
            this.components.fileViewer.render();
        }
    }
    _directoryEntryOnClick({ entryName, entryType }) {
        let selectedEntryName = entryName;
        //TODO: Differentiate between directory and file
        if (entryType && entryType == "directory") {
            this.model.switchToDirectory(selectedEntryName)
        }
        else {
            this.model.update({ currentFileName: selectedEntryName });
        }
    }
}

// eslint-disable-next-line no-unused-vars
const controller = new Controller(new Model());