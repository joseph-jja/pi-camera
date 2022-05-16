const basedir = process.cwd(),
    {
        getEnvVar
    } = require(`${basedir}/libs/env`),
    {
        prefixConfig,
        suffixConfig,
        brightnessConfig
    } = require(`${basedir}/libs/libcamera/configCommon`);

const V2_STILL_CAMERA = [
    '--width 640 --height 480',
    '--width 720 --height 480',
    '--width 768 --height 480',
    '--width 854 --height 480',
    '--width 720 --height 576',
    '--width 800 --height 600',
    '--width 960 --height 540',
    '--width 1024 --height 576',
    '--width 960 --height 640',
    '--width 1024 --height 600',
    '--width 1024 --height 768',
    '--width 1280 --height 720',
    '--width 1152 --height 864',
    '--width 1280 --height 800',
    '--width 1360 --height 768',
    '--width 1366 --height 768',
    '--width 1440 --height 900',
    '--width 1280 --height 1024',
    '--width 1536 --height 864',
    '--width 1280 --height 1080',
    '--width 1600 --height 900',
    '--width 1400 --height 1050',
    '--width 1680 --height 1050',
    '--width 1600 --height 1200',
    '--width 1920 --height 1080',
    '--width 2048 --height 1080',
    '--width 1920 --height 1200',
    '--width 2160 --height 1080',
    '--width 2048 --height 1152',
    '--width 2560 --height 1080',
    '--width 2048 --height 1536',
    '--width 2560 --height 1440',
    '--width 2560 --height 1600',
    '--width 2960 --height 1440',
    '--width 2560 --height 2048',
    '--width 3200 --height 1800',
    '--width 3200 --height 2048',
    '--width 3200 --height 2400'
];

const PIVARITY_16MP_STILL_CAMERA = [
    '--width 640 --height 480',
    '--width 720 --height 480',
    '--width 768 --height 480',
    '--width 854 --height 480',
    '--width 720 --height 576',
    '--width 800 --height 600',
    '--width 960 --height 540',
    '--width 1024 --height 576',
    '--width 960 --height 640',
    '--width 1024 --height 600',
    '--width 1024 --height 768',
    '--width 1280 --height 720',
    '--width 1152 --height 864',
    '--width 1280 --height 800',
    '--width 1360 --height 768',
    '--width 1366 --height 768',
    '--width 1440 --height 900',
    '--width 1280 --height 1024',
    '--width 1536 --height 864',
    '--width 1280 --height 1080',
    '--width 1600 --height 900',
    '--width 1400 --height 1050',
    '--width 1680 --height 1050',
    '--width 1600 --height 1200',
    '--width 1920 --height 1080',
    '--width 2048 --height 1080',
    '--width 1920 --height 1200',
    '--width 2160 --height 1080',
    '--width 2048 --height 1152',
    '--width 2560 --height 1080',
    '--width 2048 --height 1536',
    '--width 2560 --height 1440',
    '--width 2560 --height 1600',
    '--width 3840 --height 1080',
    '--width 2960 --height 1440',
    '--width 3440 --height 1440',
    '--width 2560 --height 2048',
    '--width 3200 --height 1800',
    '--width 3840 --height 1600',
    '--width 3200 --height 2048',
    '--width 3200 --height 2400',
    '--width 3840 --height 2160',
    '--width 4096 --height 2160',
    '--width 3840 --height 2400',
    '--width 4656 --height 3496'
];

const stillConfig = [{
    name: 'imageSize',
    paramName: '',
    values: (getEnvVar('PIVARITY_16MP') ? PIVARITY_16MP_STILL_CAMERA : V2_STILL_CAMERA),
    defaultvalue: '--width 3200 --height 2400'
}, {
    name: 'shutter_speed',
    paramName: '--shutter',
    values: [
        1, 10, 20, 25, 50,
        100, 200, 250, 500,
        1000, 2000, 2500, 5000, 10000,
        100000, 200000, 250000, 500000,
        1000000, 2000000, 5000000,
        10000000, 15000000, 30000000,
        60000000, 120000000, 180000000
    ],
    comment: 'time in microseconds => 1000 = 1 millisecond, 250000 = 1/4 second '
}];

module.exports = prefixConfig.concat(brightnessConfig).
concat(stillConfig).concat(suffixConfig).concat[{
    name: 'saturation',
    paramName: '--saturation',
    range: [0, 1],
    step: 0.1,
    decimalPlaces: 1
}];