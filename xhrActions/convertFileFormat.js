const {
    readFile,
    readdir
} = require('fs').promises;

const basedir = process.cwd(),
    {
        BASE_CONFIG_PATH, 
        BASE_IMAGE_PATH
    } = require(`${basedir}/libs/videoScripts`),
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
    MP4_EXT = '.mp4';

async function readConfigFile(configFile) {

    const [err, fileData] = await promiseWrapper(readFile(configFile));

    if (err) {
        return undefined;
    }
    const jsonOptions = JSON.parse(fileData.toString());

    return jsonOptions;

}

// read all the video files only
async function getFiles() {

    const [err, videoFileList] = await promiseWrapper(readdir(BASE_IMAGE_PATH));
    
    if (err) {
        logger.error(`No files found in ${BASE_IMAGE_PATH}`);
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

        if (!config) {
            reject('No config found, cannot convert!');
        }
        logger.info(`Image file ${filename} and config data ${JSON.stringify(config)}`);

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

module.exports = async (request, response) => {
    
    const files = await getFiles();

    logger.info(`Found ${files.length} files in ${BASE_IMAGE_PATH}`);

    let converted = 0;
    files.forEach(async file => {

        // make sure filename contains the image path
        const imageFile = `${BASE_IMAGE_PATH}/${file}`;
        const configFileName = `${BASE_CONFIG_PATH}/${file}.cfg`;

        //logger.info(`Image file ${imageFile} and config files ${configFileName}`);

        const config = await readConfigFile(configFileName);
        
        const [err, result] = await promiseWrapper(processFile(imageFile, config));
        logger.info(`Result from converting files ${result}`);
        if (!err) {
            converted++;
        }
    });

    response.writeHead(200, {});
    response.end(`Conversion completed! Converted ${converted} number of files.`);
};
