const {
    resolve,
    basename
} = require('path');
const FILENAME = basename(__filename);
const RESOLVED_FILE_LOCATION = resolve(__filename).replace(`/${FILENAME}`, '');

const {
    streamMjpeg
} = require(`${RESOLVED_FILE_LOCATION}/libs/libcamera/video`)(RESOLVED_FILE_LOCATION);
const {
    getFfmpegStream
} = require(`${RESOLVED_FILE_LOCATION}/libs/ffmpeg`);

const spawnOptions = [
    '--width', '1640',
    '--height', '1232',
    '--framerate', '15',
    '--exposure', 'normal'
];

// stream libcamera stdout to ffmpeg stdin
const stream = streamMjpeg(spawnOptions);
console.log(stream);
const ffmpeg = getFfmpegStream();
stream.stdout.pipe(ffmpeg.stdin);
console.log(ffmpeg);

stream.on('close', e => {
    console.log(e);
});
