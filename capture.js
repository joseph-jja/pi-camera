const os = require('os'),
    fs = require('fs'),
    http = require('http'),
    childProcess = require('child_process');

const express = require('express'),
    bodyParser = require('body-parser');

const app = express();

let videoProcess, 
    streamProcess;

const VIDEO_CMD = 'libcamera-vid',
    VIDEO_PREVIEW_OPTS = '--nopreview -t 0 --inline --listen -o tcp://0.0.0.0:10000',
    RTSP_VIDEO_PREVIEW_OPTS = '--nopreview -t 0 --inline -o -',
    RTSP_PIPED_VIDEO_PREVIEW_OPTS = 'cvlc stream:///dev/stdin --sout \'#rtp{sdp=rtsp://:10000/stream1}\' :demux=h264', 
    FFMPEG = 'ffmpeg';

// ffmpeg -v verbose -i rtmp://192.168.50.100:10000/<stream> \
// -c:v libx264 -c:a aac -ac 1 -strict -2 -crf 18 -profile:v \
// baseline -maxrate 400k -bufsize 1835k -pix_fmt yuv420p -flags \
// -global_header -hls_time 10 -hls_list_size 6 -hls_wrap 10 -start_number 1 \
// <pathToFolderYouWantTo>/<streamName>.m3u8
// ffplay tcp://192.168.50.100:10000/stream -vf "setpts=N/30" -fflags nobuffer -flags low_delay -framedrop


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
    extended: false,
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
        if (request.body && Object.keys(request.body).length > 0) {
            const options = Object.keys(request.body).filter(item => {
                return (item && item.length > 0);
            });
            if (options.length > 0) {
                if (videoProcess) {
                    videoProcess.kill(0);
                }
                videoProcess = childProcess.spawn(VIDEO_CMD + options + RTSP_VIDEO_PREVIEW_OPTS);
                videoProcess.stdout.pipe(RTSP_PIPED_VIDEO_PREVIEW_OPTS);
            }
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

