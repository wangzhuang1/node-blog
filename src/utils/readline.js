/**
 * @file: readline
 * @author: WangZhuang
 * @date: 2022/4/20 13:49:41
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

//file name
const fileName = path.join(__dirname, '../', '../', 'logs', 'access.log');

// create read stream
const readStream = fs.createReadStream(fileName);

// create readline object
const rl = readline.createInterface({
    input: readStream
});

let chromeNum = 0;
let sum = 0;

// step line output
rl.on('line', lineData => {
    if (!lineData) {
        return;
    }

    // record sum line
    sum++;

    const arr = lineData.split(' -- ');
    if (arr[2] && arr[2].includes('Chrome')) {
        // add chrome count
        chromeNum++;
    }
})

// subscript output over
rl.on('close', () => {
    console.log('chrome scale：' + chromeNum / sum * 100 + '%');
})
