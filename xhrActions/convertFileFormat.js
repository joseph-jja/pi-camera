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

    const videoFileList = await readdir(BASE_CONFIG_PATH);
    
    const files = videoFileList.filter(file => {
        return (file.endsWith(MJPEG_EXT) || file.endsWith(YUV420_EXT) ||
            file.endsWith(H264_EXT) || file.endsWith(H264_EXT) );    
    });

    return files;
}

module.exports = (request, response) => {
    
    const files = await getFiles();

    let converted = 0;
    files.forEach(async file => {

        // make sure filename contains the image path
        const filename = (file.indexOf('/images/') > -1) ? file : `${BASE_IMAGE_PATH}/${file}`;

        const configFileName = `${filename}.cfg`.replace(/\/images\//, '/imageConfig/');

        const config = await readConfigFile(configFileName);

        if (filename.endsWith(MJPEG_EXT)) {
            convertMJPEG(filename, config, filename.replace(MJPEG_EXT, MP4_EXT));
            converted++;
        } else if (filename.endsWith(YUV420_EXT)) {
            convertYUV420(filename, config, filename.replace(YUV420_EXT, MP4_EXT));
            converted++;
        } else if (filename.endsWith(H264_EXT)) {
            convertH264(filename, config, filename.replace(H264_EXT, MP4_EXT));
            converted++;
        } else if (filename.endsWith(RAW_EXT)) {
            logger.warn('Cannot convert RAW files at this time');
        }
    });

    response.writeHead(200, {});
    response.end(`Conversion completed! Converted ${converted} number of files.`);
};
