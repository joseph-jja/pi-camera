const { readFile } = require('fs/promises');

const {
    convertYUV420
} = require(`${basedir}/libs/ffmpeg`);

async function readConfigFile(configFile) {

    const fileData = await readFile(configFile).toString();

    const jsonOptions = JSON.parse(fileData);

    return jsonOptions;

}

function getFiles() {

    return [];
}

module.exports = (request, response) => {

    getFiles().forEach(async filename => {

        const configFileName = `${filename}.cfg`.replace(/\/images\//, '/imageConfig/');

        const config = await readConfigFile(configFileName);

        if (filename.endsWith('.mjpeg')) {

        } else if (filename.endsWith('.yuv420')) {

        } else if (filename.endsWith('.h264')) {
        
        }
    });
    
    response.writeHead(200, {});
    response.end('Conversion completed!');
};
