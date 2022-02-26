const os = require('os'),
    fs = require('fs'),
    http = require('http'),
    childProcess = require('child_process');

const express = require('express'),
    bodyParser = require('body-parser');

const app = express();

// VIDEO_PREVIEW_OPTS = '--nopreview -t 0 --inline --listen -o tcp://0.0.0.0:10000';
const VIDEO_CMD = 'libcamera-vid',
    VIDEO_PREVIEW_OPTS = '--nopreview -t 0 --inline -o - | cvlc stream:///dev/stdin --sout \'#rtp{sdp=rtsp://:10000/stream1}\' :demux=h264';


function getHTML(body) {
    return `<!DOCTYPE HTML>
<html>
    <head>
        <title>PI Camera</title>
    </head>
    <body>
        <form name="cameraOptions" onsubmit="return false;">
            ${body}
            <br>
            <button type="submit" id="executeButton">
                Update
            </button>
        </form>
    </body>
    <script src="/js/captureClient.js" type="text/javascript"></script>
</html>`;
}

app.use(bodyParser.urlencoded({
    limit: 100000
}));

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
   
    app.get('/js/captureClient.js', (request, response) => {
        response.writeHead(200, {
            'Content-Type': 'application/json'
        });
        fs.createReadStream('js/captureClient.js').pipe(response);
    }); 

    app.post('/update', (request, response) => {
        response.writeHead(200, {});
        response.end('');
        if (request.body && request.body.length > 0) {
            const options = Object.keys(request.body).filter(item => {
                return (item && item.length > 0);
            });
            console.log(options);
        }
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

