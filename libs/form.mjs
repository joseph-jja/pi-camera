import { EOL } from 'os';

export function buildSelect(name, paramName, values) {

    const options = values.map(item => {
        return `<option value="${paramName} ${item}">${item}</option>`;
    }).reduce((acc, next) => {
        return `${acc}${EOL}${next}`;
    });    

    return `<select name="${name}">${options}</select>`;
}

export function getRangeValues(range, step, decimalPlaces = 0) {

    const values = [];    
    for ( let i = range[0], end = range[1]; i < end; i+= +step ) {
       values.push(i.toFixed(decimalPlaces)); 
    }
    return values;
}

export function textField(name, defaultValue = '', size = 35) {
    return `<input type="text" name="${name}" value="${defaultValue}" size="35">`;
}

export function checkboxField(name, value, isEnabled = false) {
    return `<input type="checkbox" name="${name}" value="${value}">`;
}

