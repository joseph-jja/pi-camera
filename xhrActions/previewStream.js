const childProcess = require('child_process');

function writeHeaders(response) {
    //const uuid = randomUUID();
    //previewProcesses[uid] = {};
    response.writeHead(200, {
        //'Content-Type': 'video/webm',
        'Content-Type': 'multipart/x-mixed-replace;boundary=ffmpeg',
        'Cache-Control': 'no-cache'
        //'x-user-id': uuid
    });
}

module.exports = function(resolveFileLocation) {

    const stringify = require(`${resolveFileLocation}/libs/stringify`),
        logger = require(`${resolveFileLocation}/libs/logger`)(__filename),
        {
            previewProcess
        } = require(`${resolveFileLocation}/libs/videoScripts`)(resolveFileLocation);

    const setupPreviewStream = (streamObject, response) => {

        const previewCmd = previewProcess();

        writeHeaders(response);
        response.on('close', () => {
            try {
                previewCmd.stdout.unpipe(response);
            } catch(e) {
                logger.error(`Unpipe error ${stringify(e)}`);
            }
            try {
                streamObject.stdout.unpipe(previewCmd.stdin);
            } catch(e) {
                logger.error(`Unpipe error ${stringify(e)}`);
            }
            childProcess.exec(`kill -9 ${previewCmd.pid}`);
        });

        streamObject.stdout.pipe(previewCmd.stdin);
        previewCmd.stdout.pipe(response);

        streamObject.stdout.once('error', (e) => {
            previewCmd.stdout.unpipe(response);
            streamObject.stdout.unpipe(previewCmd.stdin);
            logger.error(`Stream error ${stringify(e)}`);
        });

        streamObject.stdout.once('close', () => {
            logger.info('Stream closed');
        });
    };

    return (request, response) => {
        if (global.directStreamProcess) {
            logger.info('Running via directStreamProcess doing mjpeg video');
            setupPreviewStream(global.directStreamProcess, response);
        } else if (global.imageStreamProcess) {
            logger.info('Running via imageStreamProcess doing jpeg images');
            setupPreviewStream(global.imageStreamProcess, response);
            global.imageStreamProcess.stdout.on('data', d => {
                if (d.indexOf('Still') > -1) {
                    logger.info('Still image started');
                }
            });
        } else {
            response.writeHead(200, {});
            response.end('Preview service is not running!');
        }
    };
};
