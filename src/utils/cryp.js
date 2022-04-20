/**
 * @file: cryp
 * @author: WangZhuang
 * @date: 2022/4/20 15:16:21
 */
const crypto = require('crypto');

// 密匙
const SECRET_KEY = 'wang1027'

// mod5 加密
function md5(content) {
    let md5 = crypto.createHash('md5');
    return md5.update(content).digest('hex');
}

// 加密函数
function genPassword(password) {
    const str = `password=${password}&key=${SECRET_KEY}`;
    return md5(str);
}

console.log(genPassword('123'));

module.exports = {
    genPassword
}
