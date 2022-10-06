const readline = require('readline'),
    {
        createReadStream
    } = require('fs');

const basedir = process.cwd(),
    stringify = require(`${basedir}/libs/stringify`),
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

        if (sortedStill.length === 0 || sortedVideo.length === 0) {
            logger.warn('Error getting keys from fmts.log file!');
            return Promise.reject({
                sortedStill: sortedStill,
                sortedVideo: filteredSizes
            });
        }

        sortedStill.sort(sortFn);
        sortedVideo.sort(sortFn);

        // for video we filter out some sizes
        const lastItem = sortedVideo[cameraSizes.sortedVideo.length - 1];
        const [maxWidth, maxHeight] = lastItem.replace('--width ', '').replace('--height', '').split(' ');
        const halfMaxWidth = maxWidth/2,
            halfMaxHeight = maxHeight/2;
        const filteredSizes = cameraSizes.sortedVideo.filter(item => {
            const [width, height] = item.replace('--width ', '').replace('--height', '').split(' ');
            if (width <= 1920 && height <= 1080) {
                // FHD
                return true;
            } else if (width === 3840 && height === 2160) {
                // 4K
                return true;
            } else if (width === halfMaxWidth && height === halfMaxHeight) {
                return true;
            } else if (width === maxWidth && height === maxHeight) {
                return true;
            } else {
                return false;
            }
        });
        
        logger.info('Done still! ', stringify(sortedStill));
        logger.info('Done video! ', stringify(filteredSizes));

        return Promise.resolve({
            sortedStill: sortedStill,
            sortedVideo: filteredSizes
        });
    });
}

module.exports = gstreamerProcessor;
