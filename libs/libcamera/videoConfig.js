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
    values: [
        '--mode 2028:1520:12:P',
        '--mode 2028:1080:12:P',
        '--mode 1332:990:10:P',
        '--mode 1280:960:10:P',
        '--mode 1280:800:10:P',
        '--mode 1280:720:10:P',
        '--mode 640:480:10:P'
    ]
}, {
    name: 'denoise',
    paramName: '',
    values: ['--denoise cdn_off']
}];

module.exports = prefixConfig.concat(brightnessConfig).concat(videoConfig).concat(suffixConfig);
