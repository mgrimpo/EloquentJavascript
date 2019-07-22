// Exercise: Keyboard Shortcuts
PixelEditor = class PixelEditor {
    constructor(state, config) {
        let { tools, controls, dispatch } = config;
        this.config = config;
        this.state = state;

        this.canvas = new PictureCanvas(state.picture, pos => {
            let tool = tools[this.state.tool];
            let onMove = tool(pos, this.state, dispatch);
            if (onMove) {
                return pos => onMove(pos, this.state, dispatch);
            }
        });
        this.controls = controls.map(
            Control => new Control(state, config));
        this.dom = elt("div",
            { tabIndex: 0, onkeydown: this.keyDown.bind(this) },
            this.canvas.dom, elt("br"),
            ...this.controls.reduce(
                (a, c) => a.concat(" ", c.dom), []));
    }
    syncState(state) {
        this.state = state;
        this.canvas.syncState(state.picture);
        for (let ctrl of this.controls) ctrl.syncState(state);
    }
    keyDown(event) {
        let dispatch = this.config.dispatch;
        let tools = this.config.tools;
        let ctrlOrCmdPressed = event.ctrlKey || event.metaKey;
        let zKeyPressed = event.key == "z";
        if (ctrlOrCmdPressed && zKeyPressed) {
            event.preventDefault();
            dispatch({ undo: true });
        }
        else {
            for (let key of Object.keys(tools)) {
                if (key[0] == event.key) {
                    event.preventDefault();
                    dispatch({ tool: key });
                }
            }
        }
    }
};

// Exercise: Efficient Drawing
PictureCanvas.prototype.syncState = function (picture) {
    if (this.picture == picture) return;

    if (this.picture === undefined) {
        this.picture = picture;
        drawPicture(this.picture, this.dom, scale);
    }
    else {
        updatePicture(this.dom, this.picture, picture, scale);
        this.picture = picture;
    }
};

function updatePicture(canvas, oldPicture, newPicture, scale) {
    let cx = canvas.getContext("2d");

    for (let y = 0; y < oldPicture.height; y++) {
        for (let x = 0; x < oldPicture.width; x++) {
            if (oldPicture.pixel(x, y) !== newPicture.pixel(x, y)) {
                cx.fillStyle = newPicture.pixel(x, y);
                cx.fillRect(x * scale, y * scale, scale, scale);
            }
        }
    }
}

// Exercise : Circle
function circle(pos, state, dispatch) {
    let start = pos;

    function drawCircle(end) {
        let r = Math.sqrt(Math.pow(end.x - start.x, 2) +
            Math.pow(end.y - start.y, 2));
        let roundR = Math.ceil(r);

        let drawn = [];
        for (let x = start.x - roundR; x < start.x + roundR; x++) {
            for (let y = start.y - roundR; y < start.y + roundR; y++) {
                let distance = Math.sqrt(
                    Math.pow(x - start.x, 2) +
                    Math.pow(y - start.y, 2));
                let inCircle = distance <= r;

                let inPicture =
                    x > 0 && x < state.picture.width &&
                    y > 0 && y < state.picture.height;

                if (inPicture && inCircle) {
                    drawn.push({ x, y, color: state.color });
                }
            }
        }
        dispatch({ picture: state.picture.draw(drawn) });
    }
    return drawCircle;
}
function draw(pos, state, dispatch) {
    function drawPixel({x, y}, state) {
      let drawn = {x, y, color: state.color};
      dispatch({picture: state.picture.draw([drawn])});
    }
    drawPixel(pos, state);
    return drawPixel;
  }

  function line(pos, state, dispatch) {
    // Your code here
  }


document.querySelector("div").append(
    startPixelEditor({ tools: Object.assign({}, baseTools, { circle , draw}) })
);