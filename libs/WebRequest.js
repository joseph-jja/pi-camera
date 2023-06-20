/* eslint-disable object-curly-newline, prefer-promise-reject-errors */
const httpsRequest = require('https').request;

function getDiffTime(startTime) {
    if (!startTime) {
        return 0.0;
    }
    const endTime = process.hrtime(startTime);
    return (((endTime[0] * 1e9) + endTime[1]) / 1e9);
}

// module for https requests
// supports https, GET, POST, PUT and so on
function WebRequest(options, payload) {

    return new Promise((resolve, reject) => {

        console.log(`Start time: ${new Date()}`);
        const startTime = process.hrtime();

        // handle http and https requests
        const request = httpsRequest(options, res => {

            console.log(`Response returned status code ${res.statusCode} took ${getDiffTime(startTime)}.`);
            if (res.statusCode < 200 || res.statusCode >= 300) {
                reject({ 
                    headers: res.headers
                });
                return;
            }

            const results = [];

            res.on('data', data => {
                results.push(data);
            });
            res.on('end', () => {
                console.log(`The end: ${new Date()}`);
                resolve({
                    headers: res.headers,
                    data: Buffer.concat(results).toString()
                });
            });
            res.on('error', e => {
                reject({
                    headers: res.headers,
                    data: Buffer.concat(results).toString()
                })
            });
        });

        request.on('error', err => {
            console.error(err);
        });
        request.end(payload);
    })
}

module.exports = WebRequest;