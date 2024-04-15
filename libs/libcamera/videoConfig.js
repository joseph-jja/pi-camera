const basedir = process.cwd(),
    {
        prefixConfig,
        suffixConfig,
        brightnessConfig
    } = require(`${basedir}/libs/libcamera/configCommon`);

const videoConfig = [{
    name: 'videoSize',
    paramName: '',
    values: [
        '--width 640 --height 480',
        '--width 800 --height 600',
        '--width 1280 --height 720',
        '--width 1920 --height 1080'
    ],
    defaultvalue: '--width 1920 --height 1080'
}, {
    name: 'mode',
    paramName: '',
    values: []
}, {
    name: 'denoise',
    paramName: '',
    values: ['--denoise cdn_off']
}];

module.exports = prefixConfig.concat(brightnessConfig).concat(videoConfig).concat(suffixConfig);
