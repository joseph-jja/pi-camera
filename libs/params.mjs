

export function filterParams(request, paramName) {

    const params = (request.query && request.query[paramName] ? request.query[paramName] : '');

    const options = unescape(params).trim().split(' ').filter(item => {
        return (item && item.length > 0);
    });

    return options;
}
