const os = require('os');

const basedir = process.cwd();

const stringify = require(`${basedir}/libs/stringify`),
    logger = require(`${basedir}/libs/logger`)(__filename),
    {
        getLibcameraProcess,
        getDirectStreamProcesss,
        getImageStreamProcess,
        captureEmitter,
        getVideoUpdateOptions,
        getImageUpdateOptions
    } = require(`${basedir}/libs/videoScripts`);

let lastMessage = '';

const K_TO_M = 1024 * 1024;

function collectData() {
    const streams = [
        getDirectStreamProcesss(),
        getLibcameraProcess(),
        getImageStreamProcess()
    ].filter(stream => {
        return (stream && stream.pid);
    });

    return {
        messages: lastMessage,
        memory: process.memoryUsage(),
        load: os.loadavg(),
        'free / total': `${os.freemem() / K_TO_M} out of ${os.totalmem() / K_TO_M}`,
        activeStreams: (streams.length),
        imageOptions: getImageUpdateOptions(),
        videoOptions: getVideoUpdateOptions()
    };
}

captureEmitter.on('button-exec', message => {
    lastMessage = message.status;
});

module.exports = (socket) => {
    socket.on('status', (sock) => { /* eslint-disable-line */
        const data = collectData();
        logger.debug(`System info: ${stringify(data)} `);
        socket.emit('info', data);

    });
    // on connection emit some info
    socket.emit('info', collectData());
};
