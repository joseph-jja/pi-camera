const {
    readFile,
    readdir
} = require('fs').promises;

const basedir = process.cwd(),
    {
        BASE_CONFIG_PATH, 
        BASE_IMAGE_PATH,
        captureEmitter
    } = require(`${basedir}/libs/videoScripts`),
    {
        convertYUV420,
        convertH264,
        convertMJPEG
    } = require(`${basedir}/libs/ffmpeg`),
    stringify = require(`${basedir}/libs/stringify`),
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

    if (files.length > 0) {
        return files.filter(filename => {
            if (filename.endsWith(MJPEG_EXT)) {
                const mp4Filename = filename.replace(MJPEG_EXT, MP4_EXT);
                return (!files.includes(mp4Filename));
            } else if (filename.endsWith(YUV420_EXT)) {
                const mp4Filename = filename.replace(YUV420_EXT, MP4_EXT);
                return (!files.includes(mp4Filename));
            } else if (filename.endsWith(H264_EXT)) {
                const mp4Filename = filename.replace(H264_EXT, MP4_EXT);
                return (!files.includes(mp4Filename));
            } else {
                return true;
            }    
        });
    }

    return files;
}


function processFile(filename, configFilename) {

    return new Promise(async (resolve, reject) => {

        const config = await readConfigFile(configFilename);

        if (!config) {
            reject('No config found, cannot convert!');
        }

        //logger.info(`Image file ${filename} and config data ${JSON.stringify(config)}`);

        if (filename.endsWith(MJPEG_EXT)) {
            const convert = convertMJPEG(filename, config, filename.replace(MJPEG_EXT, MP4_EXT));
            convert.once('close', (code) => {
                logger.info(`Converting file ${filename} completed with code ${code}`);
                return resolve(code);
            });
        } else if (filename.endsWith(YUV420_EXT)) {
            const convert = convertYUV420(filename, config, filename.replace(YUV420_EXT, MP4_EXT));
            convert.once('close', (code) => {
                logger.info(`Converting file ${filename} completed with code ${code}`);
                return resolve(code);
            });
        } else if (filename.endsWith(H264_EXT)) {
            const convert = convertH264(filename, config, filename.replace(H264_EXT, MP4_EXT));
            convert.once('close', (code) => {
                logger.info(`Converting file ${filename} completed with code ${code}`);
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

function emitMessage(msg) {
    captureEmitter.emit('button-exec', {
        method: 'conveeretFileFormat',
        status: msg
    });
}

module.exports = async (request, response) => {
    
    const files = await getFiles();

    logger.info(`Found ${files.length} files in ${BASE_IMAGE_PATH}`);

    const filesToConvert = files.map(file => {

        // make sure filename contains the image path
        const videoFile = `${BASE_IMAGE_PATH}/${file}`;
        const configFileName = `${BASE_CONFIG_PATH}/${file}.cfg`;

        return {
            videoFile: videoFile,
            configFileName: configFileName
        };
    });

    const convertFile = (fileList, index) => {

        const {
            videoFile,
            configFileName
        } = fileList[index];

        const handleNext = (msg) => {
            index++;
            if (index < filesToConvert.length) {
                convertFile(filesToConvert, index);
            }
            emitMessage(msg);
        };

        processFile(videoFile, configFileName).then(results => {
            const msg = `SUCCESS: Converting file ${videoFile} is ${results} index ${index} of ${fileList.length}`;
            handleNext();
            logger.info(msg);
        }).catch(err => {
            const msg = `ERROR: Converting file ${videoFile} is ${strringify(err)} index ${index} of ${fileList.length}`;
            handleNext();
            logger.error(msg);
        });
    };

    convertFile(filesToConvert, 0);

    response.writeHead(200, {});
    response.end(`Conversion in progrress!`); 
};
