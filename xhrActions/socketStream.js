const os = require('os');

const basedir = process.cwd();

const stringify = require(`${basedir}/libs/stringify`),
    logger = require(`${basedir}/libs/logger`)(__filename),
    {
        getLibcameraProcess,
        getDirectStreamProcesss,
        getImageStreamProcess,
        captureEmitter
    } = require(`${basedir}/libs/videoScripts`);

let lastMessage = '';

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
        loadAverage: os.loadavg(),
        free: os.freemem(),
        total: os.totalmem(),
        activeStreams: (streams.length)
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
