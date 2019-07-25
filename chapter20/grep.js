const fs = require('fs');
const { sep } = require('path');

let pattern = process.argv[2];

let regex = new RegExp(pattern, 'g');

let paths = process.argv.slice(3);


grep(regex, paths);

async function grep(regex, paths) {
    for (let path of paths) {
        let stat;
        try {
            stat = await fs.promises.stat(path);
        }
        catch (error) {
            if (error)
                throw error;
        }
        if (stat.isDirectory()) {
            let dirContents = await fs.promises.readdir(path);
            let relativePaths = dirContents.map(fileName => path + sep + fileName);
            grep(regex, relativePaths);
        }
        else {
            handleFile(path, regex);
        }
    }
}

function handleFile(path, regex) {
    fs.promises.readFile(path, 'utf8').then(text => {
        let matches = text.match(regex);
        if (matches) {
            console.log(`Matches found in file: ${path}`);
            console.log(matches.join('\n'));
            console.log('\n');
        }
    });
}
