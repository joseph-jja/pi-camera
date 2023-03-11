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
    values: [],
    defaultvalue: '--width 3200 --height 2400'
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
        60000000, 120000000, 180000000
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
        '60', '120', '180'
    ],
    comment: 'Time in seconds. (1/2000=500us fastest of hq?)'
}, {
    name: 'captureRaw',
    paramName: '',
    values: ['-r']
}];

module.exports = prefixConfig.concat(brightnessConfig).concat(stillConfig).concat(suffixConfig).concat([{
    name: 'saturation',
    paramName: '--saturation',
    range: [0, 1],
    step: 0.1,
    decimalPlaces: 1
}]);
