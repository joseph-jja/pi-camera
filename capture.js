const os = require('os'),
    fs = require('fs'),
    http = require('http'),
    childProcess = require('child_process');

const express = require('express'),
    bodyParser = require('body-parser');

const app = express();

let videoProcess, 
    streamProcess;

const BASH_CMD = '/bin/bash';
const VIDEO_CMD = '/home/pi/pi-camera/rtspStream.sh';
const MJPEG_CMD = '/home/pi/pi-camera/mjpegRestream.sh';

/*
// ffmpeg -v verbose -i rtmp://192.168.50.100:10000/<stream> 
// -c:v libx264 -c:a aac -ac 1 -strict -2 -crf 18 -profile:v 
// baseline -maxrate 400k -bufsize 1835k -pix_fmt yuv420p -flags 
// -global_header -hls_time 10 -hls_list_size 6 -hls_wrap 10 -start_number 1 
// /tmp/streamName.m3u8
// ffplay rtsp://192.168.50.100:10000/stream1 -vf "setpts=N/30" -fflags nobuffer -flags low_delay -framedrop
// vlc rtsp://192.168.50.100:10000/stream1
*/

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
        <br><hr><br>
        <form name="shutdown" onsubmit="return false;">
            <button type="submit" id="shutdownButton">
                Shutdown
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

    app.post('/shutdown', (request, response) => {
        response.writeHead(200, {});
        response.end('');
		childProcess.spawn('sudo', ['shutdown', '-P', 'now']);
    }); 

    app.post('/update', (request, response) => {
        response.writeHead(200, {});
        response.end('');
        if (request.body && Object.keys(request.body).length > 0) {
            const options = Object.keys(request.body).filter(item => {
                return (item && item.length > 0);
            });
            if (options.length > 0) {
                options.unshift(VIDEO_CMD);
                if (videoProcess) {
                    const pid = videoProcess.pid;
                    childProcess.exec(`kill -9 ${pid}`, () => {
                        videoProcess = childProcess.spawn(BASH_CMD, options);
                    });    
                } else {
                    videoProcess = childProcess.spawn(BASH_CMD, options);
                }
                console.log('Executed script ', options);
            }
        }
    });

    app.get('/preview', (request, response) => {
        
        if (videProcess) {
            if (streamProcess) {
                const pid = streamProcess.pid;
                childProcess.exec(`kill -9 ${pid}`, () => {
                    streamProcess = childProcess.spawn(BASH_CMD, [MJPEG_CMD]);
                    response.writeHead(200, { 
                        'Content-Type': 'multipart/x-mixed-replace;boundary=ffmpeg',
                        'Cache-Control': 'no-cache'
                    });
                    streamProcess.stdout.pipe(response);
                });    
            }

            
        } else {
            response.writeHead(200, {});
            response.end('');
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

