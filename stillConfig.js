module.exports = [{
    name: 'ISO_Gain',
    paramName: '--gain',
    range: [1, 40],
    step: 0.5,
    decimalPlaces: 1,
    comment: 'Higher value is higher ISO'
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
    defaultvalue: '--width 1640 --height 1232'
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
    defaultValue: 'centre'
}, {
    name: 'quality',
    paramName: '--quality',
    range: [1, 100],
    step: 1
}, {
    name: 'shutter_speed',
    paramName: '--shutter',
    values: [1, 2, 4, 8, 10, 20, 30, 40, 50, 100, 150, 200, 250, 500, 1000, 2000, 2500, 5000, 10000],
    defaultvalue: '15',
    comment: 'time in ms, 1 = 1/1000, 2 = 1/500, 4 = 1/250 = 1/125 or 8ms'
}, {
    name: 'exposure_profile',
    paramName: '--exposure',
    values: ['normal', 'sport', 'long'],
    defaultvalue: 'normal'
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
,{
    name: 'brightness',
    paramName: '--brightness',
    range: [-1, 1],
    step: 0.1,
    decimalPlaces: 1
}
];
