const prefixConfig = [{
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
        '--roi 0.35,0.35,0.3,0.3', 
        '--roi 0.4,0.4,0.2,0.2'
    ]
}];

const suffixConfig = [{
    name: 'framerate',
    paramName: '--framerate',
    values: [0.2, 0.5, 1, 2, 4, 8, 10, 15, 30, 60, 90, 120],
    comment: '0.2 = 5 seconds frame and 0.5 = 2 second frame'
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

const brightnessConfig = [{
    name: 'ISO_Gain',
    paramName: '--gain',
    range: [0.5, 40],
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
    name: 'exposure_profile',
    paramName: '--exposure',
    values: ['normal', 'sport', 'long'],
    defaultvalue: '--exposure normal'
}];

module.exports = {
    prefixConfig,
    suffixConfig,
    brightnessConfig
};
