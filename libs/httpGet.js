const {
    request
} = require('http');

async function httpGet(host, urlPath, headers = {}, extraOptions) {

    return new Promise((resolve, reject) => {

        const options = {
            hostname: host,
            port: extraOptions.port || 80,
            path: urlPath,
            method: 'GET',
            headers: headers
        };

        const req = request(options, (res) => {

            console.log(`STATUS: ${res.statusCode}`);
            console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

            let results = [];

            res.setEncoding('utf8');

            res.on('data', (chunk) => {
                results.push(chunk);
            });

            res.on('error', (e) => {
                reject(e);
            });

            res.on('end', () => {
                resolve(results.concat().toString());
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.end();
    });
}

module.exports = httpGet;
