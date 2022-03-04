import {
    EOL
} from 'os';

export function makeLabel(name) {
    return `<label>${name}</label>${EOL}`;
}

export function buildSelect(item) {

    const {
        name,
        paramName,
        values
    } = item;

    const options = values.map(element => {
        return `<option value="${paramName} ${element}">${element}</option>`;
    }).reduce((acc, next) => {
        return `${acc}${EOL}${next}`;
    });

    const initalOption = '<option></option>';

    return `${makeLabel(name)}<select name="${name}">${initalOption}${options}</select>`;
}

export function getRangeValues(item) {

    const {
        range,
        step,
        decimalPlaces = 0
    } = item;

    const values = [];
    for (let i = range[0], end = range[1]; i <= end; i += +step) {
        values.push(i.toFixed(decimalPlaces));
    }
    return values;
}

export function textField(item) {
    const {
        name,
        defaultValue = '',
        size = 35
    } = item;
    return `${makeLabel(name)}<input type="text" name="${name}" value="${defaultValue}" size="${size}">`;
}

export function checkboxField(item) {
    const {
        name,
        value = '',
        isEnabled = false
    } = item;
    return `${makeLabel(name)}<input type="checkbox" name="${name}" value="${value}">`;
}
