import {
    EOL
} from 'os';

export function makeLabel(name) {
    return (name ? `<label>${name}:</label>&nbsp;${EOL}`: '');
}

function getComment(item) {
    if (item.comment) {
        return `<br>${item.comment}`;
    }
    return '';
}
export function buildSelect(item) {

    const {
        name,
        paramName,
        values,
        valueNames,
        defaultvalue
    } = item;

    const options = values.map((element, index) => {
        const selectedValue = (paramName.startsWith('-') ? `${paramName} ${element}` : `${paramName}${element}`);
        const selected = (defaultvalue && defaultvalue.trim() === selectedValue.trim() ? 'selected' : '');
        const name = valueNames && valueNames[index] ? valueNames[index] : element;
        return `<option value="${selectedValue}" ${selected}>${name}</option>`;
    }).reduce((acc, next) => {
        return `${acc}${EOL}${next}`;
    });

    const initalOption = '<option></option>';

    return `${makeLabel(name)}<select name="${name}">${initalOption}${options}</select>${getComment(item)}`;
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
    return `${makeLabel(name)}<input type="text" name="${name}" value="${defaultValue}" size="${size}">${getComment(item)}`;
}

export function checkboxField(item) {
    const {
        name,
        value = '',
        isEnabled = false
    } = item;
    return `${makeLabel(name)}<input type="checkbox" name="${name}" value="${value}">${getComment(item)}`;
}
