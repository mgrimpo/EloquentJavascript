const http = require('http');
const pathLib = require('path');
const fs = require('fs');
const urlLib = require('url');

let methods = {};

const responses = {
    forbidden: {
        status: 403,
        body: 'forbidden'
    }
};

function haveWritePermssion(path) {
    let baseDirectory = process.cwd();
    let isBaseDir = path === baseDirectory;
    let belowBaseDir = path.startsWith(baseDirectory);
    return isBaseDir || belowBaseDir;
}

async function getPathFromURL(url) {
    let { pathname } = urlLib.parse(url);
    // Need to remove leading slash with slice, because url root '/' != filesystem root '/'
    let absolutPath = pathLib.resolve(decodeURIComponent(pathname).slice(1));
    return absolutPath;
}

methods.notAllowed = async function () {
    return {
        status: 405,
        body: "Method not allowed"
    };
};

methods.MKCOL = async function (request) {
    let path = await getPathFromURL(request.url);
    let status, body;
    if (haveWritePermssion(path)) {
        let stat;
        try {
            stat = fs.statSync(path);
            if (stat.isFile()) {
                status = 400;
                body = 'Bad request. File exists at path';
            }
            else {
                status = 204;
            }
        }
        catch (error) {
            fs.mkdirSync(path, {recursive : true});
            status = 200;
            body = "Directory created";
        }
    }
    else {
        ({ status, body } = responses.forbidden);
    }
    return { status, body };
};

http.createServer((request, response) => {
    console.log(`${request.method} ${request.url}`);
    let handler = methods[request.method] || methods.notAllowed;
    handler(request)
        .then(({ status, body, type }) => {
            response.writeHead(status);
            console.log(body);
            response.end(body);
        });
}).listen(8000);
