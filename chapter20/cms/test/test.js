const assert = require("assert");
const { JSDOM } = require("jsdom");
const indexjs = require("../index");

describe("example Class", () => {
    describe("example Method", () => {
        it("should always work, since this is an example", () =>
            assert.equal(1, 1));
    });
});

describe("index.js", () => {

    beforeEach(() => {
        let dom = new JSDOM();
        global.document = dom.window.document;
        global.window = dom.window;
    });

    describe("DirectoryList", (done) => {
        it("entries should be undefined on new object", () => {
            let directoryList = new indexjs.directoryList ();
            assert.equal(directoryList.entries, undefined);
        })
    })
});
