module.exports = [{
        name: 'ISO_Gain',
        paramName: '--gain',
        range: [1, 40],
        step: 0.5,
        decimalPlaces: 1
    }, {
        name: 'videoSize',
        paramName: '',
        values: [
            '--width 640 --height 480',
            '--width 1296 --height 730',
            '--width 1920 --height 1080'
        ],
        defaultvalue: '--width 640 --height 480'
    }, {
        name: 'EV_compensation',
        comment: 'higher is brighter',
        paramName: '--ev',
        range: [-10, 10],
        step: 0.1,
        decimalPlaces: 1
    /*}, {
        name: 'codec',
        paramName: '--codec',
        values: ['h264', 'mjpeg', 'yuv420']
    */}, {
        name: 'metering',
        paramName: '--metering',
        values: ['centre', 'spot', 'average'] // 'custom'
    }, {
        name: 'quality',
        paramName: '--quality',
        range: [1, 100],
        step: 1,
        defaultValue: 100
    }, {
        name: 'framerate',
        paramName: '--framerate',
        values: [1, 2, 4, 8, 10, 15, 30, 60],
        defaultValue: 10
    /*}, {
        name: 'h264_bitrate',
        paramName: '--bitrate',
        values: [307200, 946080, 2073600]
    }, {
        name: 'h264_intra',
        paramName: '--intra',
        range: [0, 100]
    }, {
        name: 'h264_profile',
        paramName: '--profile',
        values: ['baseline', 'main', 'high']
    }, {
        name: 'h264_level',
        paramName: '--level',
        values: [4, 4.1, 4.2]
    */}, {
        name: 'exposure_profile',
        paramName: '--exposure',
        values: ['normal', 'sport', 'long']
    }, {
        name: 'contrast',
        paramName: '--contrast',
        range: [0, 1],
        step: 0.1,
        decimalPlaces: 1
    }, {
        name: 'saturation',
        paramName: '--saturation',
        range: [0, 1],
        step: 0.1,
        decimalPlaces: 1
    }, {
        name: 'sharpness',
        paramName: '--sharpness',
        range: [0, 1],
        step: 0.1,
        decimalPlaces: 1
    }
    /*,{
        name: 'brightness',
        paramName: '--brightness',
        range: [-1, 1],
        step: 0.1,
        decimalPlaces: 1
    }*/
];
