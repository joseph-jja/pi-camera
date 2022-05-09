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
    name: 'imageSize',
    paramName: '',
    values: V2_STILL_CAMERA,
    comment: '1640x1232 uses full sensor with binning',
    defaultvalue: '--width 3840 --height 2464'
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
    name: 'shutter_speed',
    paramName: '--shutter',
    values: [
        1, 10, 20, 25, 50,
        100, 200, 250, 500,
        1000, 2000, 2500, 5000, 10000,
        100000, 200000, 250000, 500000,
        1000000, 2000000, 5000000,
        10000000
    ],
    comment: 'time in microseconds => 1000 = 1 millisecond, 250000 = 1/4 second '
}, {
    name: 'framerate',
    paramName: '--framerate',
    values: [0.2, 0.5, 1, 2, 4, 8, 10, 15, 30, 60, 90, 120],
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
}, {
    name: 'brightness',
    paramName: '--brightness',
    range: [-1, 1],
    step: 0.1,
    decimalPlaces: 1
}];
