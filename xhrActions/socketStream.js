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

    const memoryUsage = process.memoryUsage();
    const filtered = Object.keys(memoryUsage).map(key => {
        const megs = Math.round(memoryUsage[key] / K_TO_M);
        return {
            [key]: `${megs}M`
        };
    });

    return {
        messages: lastMessage,
        load: os.loadavg(),
        memory: filtered,
        'free / total': `${Math.round(os.freemem() / K_TO_M)}M out of ${Math.round(os.totalmem() / K_TO_M)}M`,
        'active streams': (streams.length),
        'image options': getImageUpdateOptions(),
        'video options': getVideoUpdateOptions()
    };
}

captureEmitter.on('button-exec', message => {
    lastMessage = message.status;
});

module.exports = (socket) => {
    socket.on('status', (_sock) => {
        /* eslint-disable-line */
        const data = collectData();
        logger.debug(`System info: ${stringify(data)} `);
        socket.emit('info', data);

    });
    // on connection emit some info
    socket.emit('info', collectData());
};
