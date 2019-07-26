class DirectoryList {
    constructor(directory, entries) {
        this.dom = document.querySelector("#dirList");
        this.domLabel = document.querySelector("#directoryLabel");
        this.directory = directory;
        this.entries = entries ;
    }

    _clear() {while(this.dom.firstChild) this.dom.removeChild(this.dom.firstChild)}

    async render(){
        this._clear();
        let directoryEntries = this.entries.map(
            fileName => new DirectoryEntry(fileName)
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
        this.dom = document.querySelector("textarea");
        this.fileName = undefined;
        this.fileContent = undefined;
        this._hide(true);
    }
    updateViewModel(fileName, fileContent) {
        console.log("Called fileviewer update viewModethis.l")
        console.log("sss" + fileContent);
        this.fileName = fileName;
        this.fileContent = fileContent;
    }
    _hide(bool) {
        this.dom.hidden = bool;
    }
    render(){
        console.log(this.fileContent);
        this.dom.textContent = this.fileContent;
        this._hide(false);
    }
}

class DirectoryEntry {
    constructor(entryName) {
        this.dom = document.createElement("li");
        this.dom.textContent = entryName;
        this.dom.addEventListener("click", (domEvent) =>
            this.onClick(this._mapToControllerEvent(domEvent))
        );
    }
    _mapToControllerEvent(domEvent) {
        let controllerEvent = { directoryEntryName : domEvent.target.textContent };
        return controllerEvent;
    }
}
// Paceholder for injected method
DirectoryEntry.prototype.onClick = () =>  console.log("Method stub called, method injection failed");

class Model {
    constructor() {
        this.currentDirectory = "/";
        this.directoryContent = [];
        this.currentFileName = undefined;
        this.currentFileContent = undefined;
        this.loadDirectory();
    }
    loadDirectory() {
        fetch(this.currentDirectory).then( response =>
            response.text().then( text => {
                this.directoryContent = text.split("\n");
                this.notifyChanged({directoryContent: this.directoryContent});
        }));
    }
    update(newModelValues) {
        let keys = Object.keys(newModelValues);
        keys.forEach(key => {
            if (key in this) this[key] = newModelValues[key];
            if (key == "currentDirectory") {
                this.loadDirectory()
            }
            if (key == "currentFileName"){
                this.loadFile();
            }
        }); 
        this.notifyChanged(newModelValues);
    }
    async loadFile(){
        let path = this.currentDirectory + this.currentFileName;
        if (! path) return;
        fetch(path).then(response =>
            response.text().then(text => {
                this.currentFileContent = text;
                console.log(this.currentFileContent);
                this.notifyChanged( {currentFileContent: this.currentFileContent});
            })
        );
    }
}
//Method stub to be injected with callback
Model.prototype.notifyChanged = () => { console.log("notifyChanged called before injection") };
Model.prototype.defaultDirectory = "/";


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
        if ("directoryContent" in newModelValues){
            this.components.directoryList.updateViewModel(
                this.model.currentDirectory, this.model.directoryContent );
            this.components.directoryList.render();
        }
        if ("currentFileContent" in newModelValues) {
            this.components.fileViewer.updateViewModel(
                this.model.currentFileName, this.model.currentFileContent );
            this.components.fileViewer.render();
        }
    }
    _directoryEntryOnClick({directoryEntryName}) {
        let selectedEntryName = directoryEntryName;
        //TODO Differentiate between directory and file
        this.model.update({currentFileName : selectedEntryName});
    }
}

const controller = new Controller(new Model());