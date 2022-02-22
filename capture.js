const os = require('os'),
    http = require('http'),
    childProcess = require('child_process');

const express = require('express');

const app = express();

const VIDEO_CMD = 'libcamera-vid',
    VIDEO_PREVIEW_OPTS = '--nopreview -t 0 --inline --listen -o tcp://0.0.0.0:10000';

function getHTML(body) {
    return `<!DOCTYPE HTML>
<html>
    <head>
        <title>PI Camera</title>
    </head>
    <body>
        ${body}
    </body>
</html>`;
}

async function start() {

    const baseDir = process.cwd();
    const config = require(`${baseDir}/cameraConfig`);

    const formFields = await import('./libs/form.mjs');

    const fields = config.map(item => {

        if (item.values) {
            return formFields.buildSelect(item.name, item.paramName, item.values);
        } else if (item.range) {
            const values = formFields.getRangeValues(item.range, item.step, item.decimalPlaces);
            return formFields.buildSelect(item.name, item.paramName, values);
        } else if (item.fieldValue) {
            return formFields.textField(item.name, item.fieldValue);
        } else {
            console.log(item);
            return '';
        }
    }).reduce((acc, next) => {
        return `${acc}<br><br>${os.EOL}${next}`; 
    });
   
    app.get('/', (request, response) => {
        response.writeHead(200, {
             'Content-Type': 'text/html'
        });
        response.end(getHTML(fields));
    });

    const server = http.createServer(app);
    server.listen(20000);
}

start();

