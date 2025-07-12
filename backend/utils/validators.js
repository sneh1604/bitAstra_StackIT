const validator = require('validator');
const isEmpty = require('./helpers');

// Validate user registration data
exports.validateRegisterInput = data => {
    let errors = {};

    data.username = !isEmpty(data.username) ? data.username : '';
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';
    data.password2 = !isEmpty(data.password2) ? data.password2 : '';

    // Username validation
    if (!validator.isLength(data.username, { min: 3, max: 30 })) {
        errors.username = 'Username must be between 3 and 30 characters';
    }

    if (validator.isEmpty(data.username)) {
        errors.username = 'Username field is required';
    }

    // Email validation
    if (validator.isEmpty(data.email)) {
        errors.email = 'Email field is required';
    }

    if (!validator.isEmail(data.email)) {
        errors.email = 'Email is invalid';
    }

    // Password validation
    if (validator.isEmpty(data.password)) {
        errors.password = 'Password field is required';
    }

    if (!validator.isLength(data.password, { min: 6 })) {
        errors.password = 'Password must be at least 6 characters';
    }

    if (validator.isEmpty(data.password2)) {
        errors.password2 = 'Confirm Password field is required';
    }

    if (!validator.equals(data.password, data.password2)) {
        errors.password2 = 'Passwords must match';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};

// Validate user login data
exports.validateLoginInput = data => {
    let errors = {};

    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';

    if (validator.isEmpty(data.email)) {
        errors.email = 'Email field is required';
    }

    if (!validator.isEmail(data.email)) {
        errors.email = 'Email is invalid';
    }

    if (validator.isEmpty(data.password)) {
        errors.password = 'Password field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};

// Validate question data
exports.validateQuestionInput = data => {
    let errors = {};

    data.title = !isEmpty(data.title) ? data.title : '';
    data.description = !isEmpty(data.description) ? data.description : '';
    data.tags = !isEmpty(data.tags) ? data.tags : [];

    if (validator.isEmpty(data.title)) {
        errors.title = 'Title field is required';
    }

    if (!validator.isLength(data.title, { max: 200 })) {
        errors.title = 'Title must be less than 200 characters';
    }

    if (validator.isEmpty(data.description)) {
        errors.description = 'Description field is required';
    }

    if (data.tags.length === 0) {
        errors.tags = 'At least one tag is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};