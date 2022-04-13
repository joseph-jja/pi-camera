const os = require('os');

module.exports = function(resolveFileLocation) {

    const stringify = require(`${resolveFileLocation}/libs/stringify`),
        logger = require(`${resolveFileLocation}/libs/logger`)(__filename);

    function collectData() {
        const streams = [
            global.directStreamProcess,
            global.libcameraProcess,
            global.imageStreamProcess
        ].filter(stream => {
            return (stream && stream.pid);
        });

        return {
            memory: process.memoryUsage(),
            loadAverage: os.loadavg(),
            free: os.freemem(),
            activeStreams: streams.length
        };
    }

    // use this as a timed data about the server
    return (socket) => {
        socket.on('status', (sock) => {
            const data = collectData();
            logger.info(`System info: ${stringify(data)} `);
            socket.emit('info', data);

        });
        // on connection emit some info
        socket.emit('info', collectData);
    };
};
