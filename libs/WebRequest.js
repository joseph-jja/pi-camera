/* eslint-disable object-curly-newline, prefer-promise-reject-errors */
const {
    readFile
} = require('node:fs/promises');
const httpsRequest = require('https').request;

function getDiffTime(startTime) {
    if (!startTime) {
        return 0.0;
    }
    const endTime = process.hrtime(startTime);
    return (((endTime[0] * 1e9) + endTime[1]) / 1e9);
}

function parse(jsonIn) {
    try {
        return JSON.parse(jsonIn);
    } catch (_e) {
        return jsonIn;
    }
}

// module for https requests
// supports https, GET, POST, PUT and so on
function WebRequest(options, payload, bodyMsg, boundary) {

    return new Promise(async (resolve, reject) => {

        console.log(`Start time: ${new Date()}`);
        const startTime = process.hrtime();

        if (bodyMsg && boundary) {
            options.headers['Content-Type'] = `multipart/form-data; boundary=${boundary}`;
            options.headers['Content-Length'] = bodyMsg.length;
            console.log(`Content Length: ${options.headers['Content-Length']}`, `Boundary: ${boundary}`);
        }

        // handle http and https requests
        const request = httpsRequest(options, res => {

            console.log(`Response returned status code ${res.statusCode} took ${getDiffTime(startTime)}.`);

            const results = [];

            res.on('data', data => {
                results.push(data);
            });
            res.on('end', () => {
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    console.error(`Error: ${new Date()}`);
                    reject({
                        headers: res.headers,
                        data: parse(Buffer.concat(results).toString())
                    });
                    return;
                }
                console.log(`The end: ${new Date()}`);
                resolve({
                    headers: res.headers,
                    data: parse(Buffer.concat(results).toString())
                });
            });
            res.on('error', e => {
                console.error(e);
                reject({
                    headers: res.headers,
                    data: parse(Buffer.concat(results).toString())
                })
            });
        });

        request.on('error', err => {
            console.error(err);
        });

        if (filedata && bodyMsg && bodyMsg.length > 0) {
            // first part
            request.write(bodyMsg);
            request.end();
        } else {
            request.end(payload);
        }
    })
}

module.exports = WebRequest;
