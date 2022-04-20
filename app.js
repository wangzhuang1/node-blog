const querystring = require('querystring');
const {get, set} = require('./src/db/redis')
const {access} = require('./src/utils/log');
const handleBlogRouter = require('./src/router/blog');
const handleUserRouter = require('./src/router/user');

// 获取cookie过期时间
const getCookieExpires = () => {
    const d = new Date();
    d.setTime(d.getTime() + (24 * 60 * 60) * 1000);
    return d.toUTCString();
}

// session 数据
// const SESSION_DATA = {};

// 用于处理post data
const getPostData = req => {
    const promise = new Promise((resolve, reject) => {
        if (req.method !== 'POST') {
            resolve({});
            return;
        }

        if (req.headers['content-type'] !== 'application/json') {
            resolve({});
            return;
        }

        let postData = '';

        req.on('data', chunk => {
            postData += chunk.toString();
        })

        req.on('end', () => {
            if (!postData) {
                resolve({});
                return;
            }

            resolve(JSON.parse(postData));
        })


    });
    return promise;
}

const serverHandle = (req, res) => {
    // record access log
    access(`${req.method} -- ${req.url} -- ${req.headers['user-agent']} -- ${Date.now()}`);

    // 设置返回格式
    res.setHeader('Content-type', 'application/json');

    // 获取path
    const url = req.url;
    req.path = url.split('?')[0];

    // 解析query
    req.query = querystring.parse(url.split('?')[1])

    // 解析cookie
    req.cookie = {};
    const cookieStr = req.headers.cookie || '';

    cookieStr.split(';').forEach(item => {
        if (!item) {
            return;
        }

        const arr = item.split('=');
        const key = arr[0].trim();
        const val = arr[1].trim();

        req.cookie[key] = val;
    });

    // 解析session
    // let needSetCookie = false;
    // let userId = req.cookie.userid;
    // if (userId) {
    //     if (!SESSION_DATA[userId]) {
    //         SESSION_DATA[userId] = {};
    //     }
    // } else {
    //     needSetCookie = true;
    //     userId = Date.now() + '_' + Math.random();
    //     SESSION_DATA[userId] = {};
    // }
    // req.session = SESSION_DATA[userId]

    // 解析session 使用redis
    let needSetCookie = false;
    let userId = req.cookie.userid;

    if (!userId) {
        needSetCookie = true
        userId = Date.now() + '_' + Math.random();
        // 初始化session
        set(userId, {});
    }
    // 获取session
    req.sessionId = userId;
    get(userId).then(sessionData => {
        if (sessionData === null) {
            // 初始化redis中的session
            set(req.sessionId, {});

            // 设置 session
            req.session = {};
        } else {
            req.session = sessionData;
        }
        // 处理postdata
        return getPostData(req);
    }).then(postData => {
        req.body = postData;

        // 处理blog路由
        // const blogData = handleBlogRouter(req, res)
        const blogResult = handleBlogRouter(req, res)

        if (blogResult) {
            blogResult.then(blogData => {
                if (needSetCookie) {
                    res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOlay; expires=${getCookieExpires()}`);
                }

                return res.end(JSON.stringify(blogData));
            })
            return;
        }


        // 处理user路由

        const userResult = handleUserRouter(req, res)

        if (userResult) {
            userResult.then(userDta => {
                if (needSetCookie) {
                    res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOlay; expires=${getCookieExpires()}`);
                }
                res.end(JSON.stringify(userDta));
            })
            return;
        }


        // 未命中路由，返回404
        res.writeHead(404, {'Content-type': 'text/plain'})
        res.write('404 Not Found');
        res.end();
    })

}

module.exports = serverHandle;
