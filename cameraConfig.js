module.exports = [{
    name: 'ISO_Gain',
    paramName: '--gain',
    range: [1, 40],
    step: 0.5,
    decimalPlaces: 1,
    comment: 'Higher value is higher ISO'
}, {
    name: 'videoSize',
    paramName: '',
    values: [
        '--width 640 --height 480 --profile high',
        '--width 1280 --height 720 --profile high',
        '--width 1920 --height 1080 --profile high',
        '--width 1640 --height 922 --profile high',
        '--width 1640 --height 1232 --profile high'
    ],
    defaultvalue: '--width 640 --height 480 --profile high'
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
    values: ['centre', 'spot', 'average'] // 'custom'
}, {
    name: 'quality',
    paramName: '--quality',
    range: [1, 100],
    step: 1,
    defaultvalue: '100'
}, {
    name: 'framerate',
    paramName: '--framerate',
    values: [1, 2, 4, 8, 10, 15, 30, 60, 90, 120],
    defaultvalue: '8'
}, {
    name: 'exposure_profile',
    paramName: '--exposure',
    values: ['normal', 'sport', 'long'],
    defaultvalue: 'long'
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
