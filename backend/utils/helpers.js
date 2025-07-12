exports.isEmpty = value =>
    value === undefined ||
    value === null ||
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (typeof value === 'string' && value.trim().length === 0);

exports.sanitizeInput = input => {
    if (typeof input === 'string') {
        // Remove HTML tags and trim whitespace
        return input.replace(/<[^>]*>/g, '').trim();
    }
    return input;
};

exports.paginate = (query, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    return query.skip(skip).limit(limit);
};