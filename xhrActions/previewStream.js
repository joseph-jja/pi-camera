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
        const previewCmdCB = (d) => {
            response.write(d);
        };

        writeHeaders(response);
        response.on('close', () => {
            previewCmd.stdout.off('data', previewCmdCB);
            childProcess.exec(`kill -9 ${previewCmd.pid}`);
        });
        previewCmd.stdout.on('data', previewCmdCB);

        streamObject.stdout.pipe(previewCmd.stdin);

        streamObject.stdout.once('error', (e) => {
            logger.error(`Stream error ${stringify(e)}`);
        });
        streamObject.stdout.once('close', () => {
            logger.info('Stream closed');
        });
    };

    return (request, response) => {
        if (global.directStreamProcess) {
            setupPreviewStream(global.directStreamProcess, response);
        } else if (global.imageStreamProcess) {
            setupPreviewStream(global.imageStreamProcess, response);
        } else {
            response.writeHead(200, {});
            response.end('Preview service is not running!');
        }
    };
};
