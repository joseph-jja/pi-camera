const os = require('os');

const basedir = process.cwd();

const stringify = require(`${basedir}/libs/stringify`),
    logger = require(`${basedir}/libs/logger`)(__filename),
    {
        getLibcameraProcess,
        getDirectStreamProcesss
    } = require(`${basedir}/libs/videoScripts`);

function collectData() {
    const streams = [
        getDirectStreamProcesss(),
        getLibcameraProcess(),
        global.imageStreamProcess
    ].filter(stream => {
        return (stream && stream.pid);
    });

    return {
        memory: process.memoryUsage(),
        loadAverage: os.loadavg(),
        free: os.freemem(),
        activeStreams: (streams.length + Object.keys(global.previewProcessMap).length)
    };
}

module.exports = (socket) => {
    socket.on('status', (sock) => {
        const data = collectData();
        logger.info(`System info: ${stringify(data)} `);
        socket.emit('info', data);

    });
    // on connection emit some info
    socket.emit('info', collectData());
};
