const prefixConfig = [{
    name: 'preview',
    paramName: '',
    values: ['--nopreview', '--preview 0,100,640,480']
}, {
    name: 'viewfinder',
    paramName: '',
    values: [
        '--viewfinder-width 1280 --viewfinder-height 800',
        '--viewfinder-width 800 --viewfinder-height 600',
        '--viewfinder-width 640 --viewfinder-height 480'
    ]
}, {
    name: 'mode',
    paramName: '',
    values: [
        '--mode 1280:720:10',
        '--mode 640:480:10'
    ]
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
    values: [0.2, 0.5, 1, 2, 4, 8, 10, 15, 30, 60, 90, 120, 150, 180, 200],
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

// ISO_Gain v2 camera raw format reported
// 1 - 100
// 2 - 200
// 3 - 297
// 4 - 400
// 5 - 492
// 6 - 595
// 7 - 691
// 8 - 800
// 9 - 882
// 10 - 984
// 11 - 1066
// 12 - 1066
const brightnessConfig = [{
    name: 'ISO_Gain',
    paramName: '--gain',
    range: [0.5, 40],
    step: 0.5,
    decimalPlaces: 1,
    comment: 'Higher value is higher ISO'
}, {
    name: 'EV_compensation',
    comment: 'higher is brighter',
    paramName: '--ev',
    range: [-10, 10],
    step: 0.5,
    decimalPlaces: 1
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