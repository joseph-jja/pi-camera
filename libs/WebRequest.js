/* eslint-disable object-curly-newline, prefer-promise-reject-errors */
const fs = require('fs');
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
    } catch(_e) {
        return jsonIn;
    }
}

const CRLF = '\r\n';
const LF = '\n';
const MIME_VERSION = `MIME-Version: 1.0${CRLF}`;
const FIRST_PART_CONTENT_TYPE = `Content-Type: text/plain${CRLF}`;
const SECOND_PART_CONTENT_TYPE = `Content-Type: application/octet-stream${CRLF}`;
const FIRST_PART_CONTENT_DISPOSITION = `Content-Disposition: form-data; name="request-json"${CRLF}${CRLF}`;

const SECOND_PART_CONTENT_DISPOSITION = filename => `Content-Disposition: form-data; name="file"; filename="${filename}"${CRLF}${CRLF}`;

const getPayloadSize = (boundary, filename, payload) => {
    const stat = fs.statSync(filename);

    let resultLen = `${boundary}${LF}`.length;
    resultLen += FIRST_PART_CONTENT_TYPE.length;
    resultLen += MIME_VERSION.length;
    resultLen += FIRST_PART_CONTENT_DISPOSITION.length;
    resultLen += payload.length;
    resultLen += `${LF}${boundary}${LF}`.length;

    resultLen += SECOND_PART_CONTENT_TYPE.length;
    resultLen += MIME_VERSION.length;
    resultLen += SECOND_PART_CONTENT_DISPOSITION(filename).length;
    resultLen += stat.size;
    resultLen += `${LF}${boundary}--${LF}`.length;

    return resultLen;
};

// module for https requests
// supports https, GET, POST, PUT and so on
function WebRequest(options, payload, filePath) {

    return new Promise((resolve, reject) => {

        console.log(`Start time: ${new Date()}`);
        const startTime = process.hrtime();

        // specific to nova.astrometry.net file upload
        const boundary = `--===============${Date.now()}==`;
        if (filePath) {
            options.headers['Content-Type'] = `multipart/form-data; boundary=${boundary}`;
            options.headers['Content-Length'] = getPayloadSize(boundary, filePath, payload);
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

        if (filePath) {
            // first part
            request.write(`${boundary}${LF}`);
            request.write(FIRST_PART_CONTENT_TYPE);
            request.write(MIME_VERSION);
            request.write(FIRST_PART_CONTENT_DISPOSITION);
            request.write(payload);
            request.write(`${LF}${boundary}${LF}`);
            
            // second part
            const fileStream = fs.createReadStream(filePath);
            request.write(SECOND_PART_CONTENT_TYPE);
            request.write(MIME_VERSION);
            request.write(SECOND_PART_CONTENT_DISPOSITION(filePath));
            fileStream.pipe(request, { end: false });
            fileStream.on('end', () => {
                request.end(`${LF}${boundary}--${LF}`);
            });
        } else {
            request.end(payload);
        }
    })
}

module.exports = WebRequest;

/*

    // Write the multipart/form-data body
    req.write(`--${boundary}\r\n`);
    req.write(`Content-Disposition: form-data; name="file"; filename="${filePath}"\r\n`);
    req.write(`Content-Type: application/octet-stream\r\n\r\n`);
    fileStream.pipe(req, { end: false });
    fileStream.on('end', () => {
      req.end(`\r\n--${boundary}--`);
    });
  });
}

// Example usage
const uploadUrl = 'https://example.com/upload';
const filePath = '/path/to/file.txt';

createFormDataUpload(uploadUrl, filePath)
  .then((response) => {
    console.log('Upload successful:', response);
  })
  .catch((error) => {
    console.error('Upload failed:', error);
  });
*/