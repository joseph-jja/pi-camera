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

module.exports = [{
    name: 'preview',
    paramName: '',
    values: ['--nopreview']
}, {
    name: 'autofocus',
    paramName: '',
    values: [
        '--autofocus 0',
        '--autofocus 1'
    ]
}, {
    name: 'zoom',
    paramName: '',
    values: [
        '--roi 0.25,0.25,0.5,0.5',
        '--roi 0.35,0.35,0.3,0.3'
    ]
}, {
    name: 'videoSize',
    paramName: '',
    values: V2_VIDEO_CAMERA,
    defaultvalue: '--width 1920 --height 1080'
}, {
    name: 'ISO_Gain',
    paramName: '--gain',
    range: [1, 40],
    step: 0.5,
    decimalPlaces: 1,
    comment: 'Higher value is higher ISO'
}, {
    name: 'AWB_Gain',
    paramName: '--awbgains',
    multiRange: {
        joinedBy: ',',
        ranges: [
            [0, 50],
            [0, 50]
        ]
    },
    step: 0.5,
    decimalPlaces: 1,
    comment: 'Change amount of red and blue, higher means more'
}, {
    name: 'EV_compensation',
    comment: 'higher is brighter',
    paramName: '--ev',
    range: [-10, 10],
    step: 0.5,
    decimalPlaces: 1
}, {
    name: 'metering',
    paramName: '--metering',
    values: ['centre', 'spot', 'average'], // 'custom'
    defaultValue: '--metering centre'
}, {
    name: 'quality',
    paramName: '--quality',
    range: [1, 100],
    step: 1
}, {
    name: 'framerate',
    paramName: '--framerate',
    values: [0.2, 0.5, 1, 2, 4, 8, 10, 15, 30, 60, 90, 120],
    defaultvalue: '--framerate 10',
    comment: '0.2 = 5 seconds frame and 0.5 = 2 second frame'
}, {
    name: 'exposure_profile',
    paramName: '--exposure',
    values: ['normal', 'sport', 'long'],
    defaultvalue: '--exposure normal'
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
}];
