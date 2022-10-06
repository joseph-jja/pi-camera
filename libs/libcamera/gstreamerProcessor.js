const readline = require('readline'),
    {
        createReadStream
    } = require('fs');

const basedir = process.cwd(),
    logger = require(`${basedir}/libs/logger`)(__filename);

async function gstreamerProcessor() {

    const fmts = createReadStream('/tmp/fmts.log');

    const rl = readline.createInterface({
        input: fmts
    });

    const still = new Set(),
        video = new Set();

    rl.on('line', line => {

        const iw = line.indexOf('width'),
            ih = line.indexOf('height');

        const width = line.substring(iw + 6).split(' ')[0].trim().replace(/\,/g, '');
        const height = line.substring(ih + 7).trim();

        if (!isNaN(width) && !isNaN(height)) {
            still.add(`--width ${width} --height ${height}`);
            video.add(`--width ${width} --height ${height}`);
        }

    });

    const sortFn = (a, b) => {
        const wha = a.replace('--width ', '').replace('--height', '').split(' '),
            whb = b.replace('--width ', '').replace('--height', '').split(' ');

        if (parseInt(wha[0]) > parseInt(whb[0])) {
            return 1;
        } else if (parseInt(wha[0]) < parseInt(whb[0])) {
            return -1;
        } else {
            if (parseInt(wha[1]) > parseInt(whb[1])) {
                return 1;
            } else if (parseInt(wha[1]) < parseInt(whb[1])) {
                return -1;
            } else {
                return 0;
            }
        }
    };

    rl.on('close', () => {
        const sortedStill = Array.from(still.keys()),
            sortedVideo = Array.from(video.keys());

        sortedStill.sort(sortFn);
        sortedVideo.sort(sortFn);

        logger.info('Done still! ', sortedStill);
        logger.info('Done video! ', sortedVideo);

        return Promise.resolve({
            sortedStill: sortedStill,
            sortedVideo: sortedVideo
        });

    });

}

module.exports = gstreamerProcessor;
