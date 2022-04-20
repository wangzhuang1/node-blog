/**
 * @file: log
 * @author: WangZhuang
 * @date: 2022/4/20 12:29:45
 */

const fs = require('fs');
const path = require('path');

// write log
function writeLog(writeStream, log) {
    writeStream.write(log + '\n');
}

// create write Stream
function createWriteStream(fileName) {
    const fullFileName = path.join(__dirname, '../', '../', 'logs', fileName);
    const writeStream = fs.createWriteStream(fullFileName, {
        flags: 'a'
    })

    return writeStream;
}


// write visit log
const accessWriteStream = createWriteStream('access.log');

function access(log) {
    if (process.env.NODE_ENV === 'production') {
        writeLog(accessWriteStream, log);
    } else {
        // console.log(log);
        writeLog(accessWriteStream, log);
    }

}


module.exports = {
    access
}
