module.exports = function(resolveFileLocation) {

    const stringify = require(`${resolveFileLocation}/libs/stringify`),
        logger = require(`${resolveFileLocation}/libs/logger`)(__filename),
        {
            previewProcess
        } = require(`${resolveFileLocation}/libs/videoScripts`)(resolveFileLocation);

    const setupPreviewStream = (streamObject, socket) => {

        const previewCmd = previewProcess();
        const previewCmdCB = (d) => {
            socket.emit('image', d);
        };
        previewCmd.stdout.on('data', previewCmdCB);

        streamObject.stdout.pipe(previewCmd.stdin);

        streamObject.stdout.once('error', (e) => {
            streamObject.stdout.unpipe(previewCmd.stdin);
            socket.emit('error!', { message: e } );
            logger.error(`Stream error ${stringify(e)}`);
        });

        streamObject.stdout.once('close', () => {
            socket.emit('error!', { message: 'Closed!' } );
            logger.info('Stream closed');
        });
    };

    return (socket) => {
        if (global.directStreamProcess) {
            logger.info('Running via directStreamProcess doing mjpeg video');
            setupPreviewStream(global.directStreamProcess, socket);
        } else if (global.imageStreamProcess) {
            logger.info('Running via imageStreamProcess doing jpeg images');
            setupPreviewStream(global.imageStreamProcess, socket);
            *//*global.imageStreamProcess.stderr.on('data', d => {
                if (d.indexOf('Still') > -1) {
                    logger.info('Still image started');
                }
            });*/
        } else {
            socket.emit('error!', { message: 'No preview service running!' } );
        }
    };
};
