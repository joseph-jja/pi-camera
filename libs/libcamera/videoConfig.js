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
        '--mode 1280:960:10',
        '--mode 1280:800:10',
        '--mode 1280:720:10',
        '--mode 640:480:10'
    ]
}, {
    name: 'quality',
    paramName: '--quality',
    range: [1, 100],
    step: 1
}];

module.exports = prefixConfig.concat(brightnessConfig).concat(videoConfig).concat(suffixConfig);
