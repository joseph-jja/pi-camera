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

let lastMessage = '',
    previewConfig = '';

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
        'preview config': previewConfig,
        'last update': new Date(),
        load: os.loadavg(),
        memory: filtered,
        'free / total': `${Math.round(os.freemem() / K_TO_M)}M out of ${Math.round(os.totalmem() / K_TO_M)}M`,
        'active streams': (streams.length),
        'image options': getImageUpdateOptions(),
        'video options': getVideoUpdateOptions()
    };
}

captureEmitter.on('button-exec', message => {
    // saveImagesData - messages about saved images
    // imageStream - messages about testing the image stream
    // directStream - preview is enabled
    // previewStream - error when preview service is not running 
    // saveVideoData - messages about saved videos
    // previewSavedVideo - preview saved video 
    // previewImageConfig - sends config data to UI
    // previewVideoConfig - sends config data to UI
    // convertFileFormat - if we convert file formats this is where the messages go
    if (message.method === 'previewImageConfig' || message.method === 'previewImageConfig') {
        previewConfig = message.status;
    } else {
        lastMessage = message.status;
    }
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

    captureEmitter.on('histogram', message => {
        socket.emit('histogram', message);
    });

    captureEmitter.on('plate-solve', message => {
        socket.emit('plate-solve', message);
    });
};
