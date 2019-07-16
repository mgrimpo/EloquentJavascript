class ConwayGame {

    constructor(dimension) {
        this.dimension = dimension;
        this.rows = [];
        this._randomInit_();
    }

    _randomInit_() {
        for (let row = 0; row < this.dimension; row++) {
            this.rows[row] = [];
            for (let cell = 0; cell < this.dimension; cell++) {
                this.rows[row][cell] = Math.random() > 0.5;
            }
        }
    }

    numberOfLiveNeighbors(row, cell) {
        let liveNeighbors = 0;

        for (let neighborRow = row - 1; neighborRow < row + 2; neighborRow++) {

            if (neighborRow < 0 || neighborRow >= this.dimension) continue;

            for (let neighborCell = cell - 1; neighborCell < cell + 2; neighborCell++) {
                
                if (neighborCell < 0 || neighborCell >= this.dimension) continue;

                let cellIsAlive = this.rows[neighborRow][neighborCell]; 
                if (cellIsAlive) liveNeighbors++;
            }
        }
       // Don't count yourself as a neighbor 
        if(this.rows[row][cell]) liveNeighbors--;

        return liveNeighbors;
    }

    livesInNext(alive, numberOfLiveNeighbors) {
        let willLive = false;
        if (alive)  {
            willLive = numberOfLiveNeighbors == 2 || numberOfLiveNeighbors == 3;
        }
        else {
            willLive = numberOfLiveNeighbors == 3;
        }
        return willLive;
    }

    next() {
        let nextRows = [];
        for (let row = 0; row < this.dimension; row++) {
            nextRows[row] = [];
            for(let cell = 0; cell < this.dimension; cell++){
                let liveNeighbors = this.numberOfLiveNeighbors(row, cell);
                nextRows[row][cell] = this.livesInNext(this.rows[row][cell],
                     liveNeighbors);
            }
        }
        this.rows = nextRows;
    }
}

class ConwayUI {

    constructor(conwayGame) {
        this.game = conwayGame;
        this.grid = document.querySelector("#grid");
        for (let row = 0; row < this.game.dimension; row++) {
            let div = document.createElement("div");
            div.id = "row" + row;
            div.classList.add("row");
            for(let cell = 0; cell < this.game.dimension; cell++) {
                let checkbox  = this._prepareCheckbox(row, cell);
                div.append(checkbox);
            }
            this.grid.append(div);
        }
    }

    _prepareCheckbox(row, cell){
        let checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.id = this._getCellId(row, cell);
        checkbox.classList.add("cell");
        checkbox.checked = this.game.rows[row][cell];
        checkbox.addEventListener("change", (event) => {
            this.game.rows[row][cell] =  event.target.checked;
        });
        return checkbox;
    }

    _getCellId(row, cell) {
        let cellId = `row${row}cell${cell}`;
        return cellId;
    }

    _setValue(row, cell, value) {
        let cellId = this._getCellId(row, cell);
        let checkbox = document.getElementById(cellId);
        checkbox.checked = value;
    }

    _updateGrid() {
        for (let row = 0; row < this.game.dimension; row++) {
            for (let cell = 0; cell < this.game.dimension; cell++) {
                let value = this.game.rows[row][cell];
                this._setValue(row, cell, value);
            }
        }
    }

    next(){
        this.game.next();
        this._updateGrid();
    }
}

let refreshRate = 400;
let game = new ConwayGame(20);
let ui = new ConwayUI(game);

let interval = window.setInterval(() => ui.next(), refreshRate);
function toggleTimer() {
    if(interval) {
        window.clearInterval(interval);
        interval = 0;
    }
    else {
        interval = window.setInterval(() => ui.next(), refreshRate);
    }
}
window.addEventListener("keydown", event => {
    if (event.key == " ") toggleTimer();
});

document.querySelector("#toggle").addEventListener("click", () => {
    toggleTimer();
});
