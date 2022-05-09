module.exports = [{
    name: 'preview',
    paramName: '',
    values: ['--nopreview']
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
    values: [
        '--width 640 --height 480',
        '--width 800 --height 600',
        '--width 1280 --height 720',
        '--width 1920 --height 1080',
        '--width 1640 --height 922',
        '--width 1640 --height 1232',
        '--width 3840 --height 2464'
    ],
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
