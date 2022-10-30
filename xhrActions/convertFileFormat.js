const {
    readFile,
    readdir
} = require('fs/promises');

const basdir = process.cwd(),
    {
        BASE_CONFIG_PATH
    } = = require(`${basedir}/libs/videoScripts`),
    {
        convertYUV420,
        convertH264,
        convertMJPEG
    } = require(`${basedir}/libs/ffmpeg`),
    promiseWrapper = require(`${basedir}/libs/PromiseWrapper`),
    logger = require(`${basedir}/libs/logger`)(__filename);

const MJPEG_EXT = '.mjpeg',
    RAW_EXT = '.raw',
    YUV420_EXT = '.yuv420',
    H264_EXT = '.h264', 
    MP4_EXT = '.mp4;

async function readConfigFile(configFile) {

    const fileData = await readFile(configFile).toString();

    const jsonOptions = JSON.parse(fileData);

    return jsonOptions;

}

// read all the video files only
function getFiles() {

    const [err, videoFileList] = await promiseWrapper(readdir(BASE_CONFIG_PATH));
    
    if (err) {
        return [];
    }
    
    const files = videoFileList.filter(file => {
        return (file.endsWith(MJPEG_EXT) || file.endsWith(YUV420_EXT) ||
            file.endsWith(H264_EXT) || file.endsWith(H264_EXT) );    
    });

    return files;
}


function processFile(filename, config) {

    return new Promise((resolve, reject) => {
        
        if (filename.endsWith(MJPEG_EXT)) {
            const convert = convertMJPEG(filename, config, filename.replace(MJPEG_EXT, MP4_EXT));
            convert.once('close', (code) => {
                return resolve(code);
            });
        } else if (filename.endsWith(YUV420_EXT)) {
            const convert = convertYUV420(filename, config, filename.replace(YUV420_EXT, MP4_EXT));
            convert.once('close', (code) => {
                return resolve(code);
            });
        } else if (filename.endsWith(H264_EXT)) {
            const convert = convertH264(filename, config, filename.replace(H264_EXT, MP4_EXT));
            convert.once('close', (code) => {
                return resolve(code);
            });
        } else if (filename.endsWith(RAW_EXT)) {
            logger.warn('Cannot convert RAW files at this time');
            return resolve(-1);
        } else {
            return resolve(-1);
        }
    });
}

module.exports = (request, response) => {
    
    const files = await getFiles();

    let converted = 0;
    files.forEach(async file => {

        // make sure filename contains the image path
        const filename = (file.indexOf('/images/') > -1) ? file : `${BASE_IMAGE_PATH}/${file}`;

        const configFileName = `${filename}.cfg`.replace(/\/images\//, '/imageConfig/');

        const config = await readConfigFile(configFileName);
        
        const [err, result] = await promiseWrapper(processFile(filename, config));
        if (!err) {
            converted++;
        }
    });

    response.writeHead(200, {});
    response.end(`Conversion completed! Converted ${converted} number of files.`);
};
