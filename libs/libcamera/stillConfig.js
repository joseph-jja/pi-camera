const basedir = process.cwd(),
    {
        prefixConfig,
        suffixConfig,
        brightnessConfig
    } = require(`${basedir}/libs/libcamera/configCommon`);

const MULTIPLIER_FOR_SHUTTER_SPEED = 1000000;

const stillConfig = [{
    name: 'imageSize',
    paramName: '',
    values: [
        '--width 640 --height 480',
        '--width 800 --height 600',
        '--width 1280 --height 720',
        '--width 1920 --height 1080'
    ],
    defaultvalue: '--width 1920 --height 1080'
}, {
    name: 'shutter_speed',
    paramName: '--shutter',
    values: [
        // about 100us
        Math.round(1 / 10000 * MULTIPLIER_FOR_SHUTTER_SPEED),
        Math.round(1 / 6000 * MULTIPLIER_FOR_SHUTTER_SPEED),
        // about 200us
        Math.round(1 / 5000 * MULTIPLIER_FOR_SHUTTER_SPEED),
        Math.round(1 / 4000 * MULTIPLIER_FOR_SHUTTER_SPEED),
        // this is about 333us
        Math.round(1 / 3000 * MULTIPLIER_FOR_SHUTTER_SPEED),
        Math.round(1 / 2500 * MULTIPLIER_FOR_SHUTTER_SPEED),
        // this is about 500us
        Math.round(1 / 2000 * MULTIPLIER_FOR_SHUTTER_SPEED),
        Math.round(1 / 1500 * MULTIPLIER_FOR_SHUTTER_SPEED),
        Math.round(1 / 1000 * MULTIPLIER_FOR_SHUTTER_SPEED),
        Math.round(1 / 500 * MULTIPLIER_FOR_SHUTTER_SPEED),
        Math.round(1 / 400 * MULTIPLIER_FOR_SHUTTER_SPEED),
        Math.round(1 / 300 * MULTIPLIER_FOR_SHUTTER_SPEED),
        Math.round(1 / 200 * MULTIPLIER_FOR_SHUTTER_SPEED),
        Math.round(1 / 100 * MULTIPLIER_FOR_SHUTTER_SPEED),
        Math.round(1 / 50 * MULTIPLIER_FOR_SHUTTER_SPEED),
        Math.round(1 / 25 * MULTIPLIER_FOR_SHUTTER_SPEED),
        Math.round(1 / 16 * MULTIPLIER_FOR_SHUTTER_SPEED),
        Math.round(1 / 8 * MULTIPLIER_FOR_SHUTTER_SPEED),
        250000, 500000,
        1000000, 2000000, 5000000,
        10000000, 15000000, 20000000,
        25000000, 30000000,
        60000000, 120000000, 180000000,
        240000000, 300000000, 400000000, 500000000, 600000000
    ],
    valueNames: [
        '1/10000', '1/6000', '1/5000', '1/4000',
        '1/3000', '1/2500', '1/2000', '1/1500',
        '1/1000', '1/500', '1/400', '1/300',
        '1/200', '1/100', '1/50', '1/25',
        '1/16', '1/8', '1/4', '1/2',
        '1', '2', '5',
        '10', '15', '20',
        '25', '30',
        '60', '120', '180',
        '240', '300', '400', '500', '600'
    ],
    comment: 'Time in seconds. (1/2000=500us fastest of hq?)'
}, {
    name: 'captureRaw',
    paramName: '',
    values: ['-r']
}];

module.exports = prefixConfig.concat(brightnessConfig).concat(stillConfig).concat(suffixConfig);
