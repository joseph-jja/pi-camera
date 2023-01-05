const basedir = process.cwd(),
    {
        prefixConfig,
        suffixConfig,
        brightnessConfig
    } = require(`${basedir}/libs/libcamera/configCommon`);

const videoConfig = [{
    name: 'videoSize',
    paramName: '',
    values: [],
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
