const basedir = process.cwd(),
    {
        getEnvVar
    } = require(`${basedir}/libs/env`),
    {
        prefixConfig,
        suffixConfig,
        brightnessConfig
    } = require(`${basedir}/libs/libcamera/configCommon`);

const V2_VIDEO_CAMERA = [
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
    '--width 1920 --height 1080'
];

const PIVARITY_16MP_VIDEO_CAMERA = [
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
    '--width 1920 --height 1080'
];

const videoConfig = [{
    name: 'videoSize',
    paramName: '',
    values: (getEnvVar('PIVARITY_16MP') ? PIVARITY_16MP_VIDEO_CAMERA : V2_VIDEO_CAMERA),
    defaultvalue: '--width 1920 --height 1080'
}];

module.exports = prefixConfig.concat(brightnessConfig).concat(videoConfig).concat(suffixConfig);