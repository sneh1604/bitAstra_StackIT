const Tag = require('../models/Tag.model');
const Question = require('../models/Question.model');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all tags
// @route   GET /api/tags
// @access  Public
exports.getTags = async (req, res, next) => {
    try {
        const { popular } = req.query;
        let query = Tag.find();

        if (popular) {
            query = query.sort('-questionsCount').limit(10);
        } else {
            query = query.sort('name');
        }

        const tags = await query;

        res.status(200).json({
            success: true,
            count: tags.length,
            data: tags
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single tag
// @route   GET /api/tags/:id
// @access  Public
exports.getTag = async (req, res, next) => {
    try {
        const tag = await Tag.findById(req.params.id);

        if (!tag) {
            return next(new ErrorResponse('Tag not found', 404));
        }

        const questions = await Question.find({ tags: tag._id })
            .populate('author', 'username avatar')
            .populate('tags')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            data: {
                tag,
                questions
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Follow/Unfollow tag
// @route   PUT /api/tags/:id/follow
// @access  Private
exports.followTag = async (req, res, next) => {
    try {
        const tag = await Tag.findById(req.params.id);

        if (!tag) {
            return next(new ErrorResponse('Tag not found', 404));
        }

        const userIndex = tag.followers.indexOf(req.user.id);

        if (userIndex === -1) {
            // Follow tag
            tag.followers.push(req.user.id);
        } else {
            // Unfollow tag
            tag.followers.splice(userIndex, 1);
        }

        await tag.save();

        res.status(200).json({
            success: true,
            data: tag
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create tag (admin only)
// @route   POST /api/tags
// @access  Private/Admin
exports.createTag = async (req, res, next) => {
    try {
        const { name, description } = req.body;

        // Check if tag exists
        let tag = await Tag.findOne({ name: name.toLowerCase() });

        if (tag) {
            return next(new ErrorResponse('Tag already exists', 400));
        }

        tag = await Tag.create({
            name: name.toLowerCase(),
            description
        });

        res.status(201).json({
            success: true,
            data: tag
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update tag (admin only)
// @route   PUT /api/tags/:id
// @access  Private/Admin
exports.updateTag = async (req, res, next) => {
    try {
        let tag = await Tag.findById(req.params.id);

        if (!tag) {
            return next(new ErrorResponse('Tag not found', 404));
        }

        tag = await Tag.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: tag
        });
    } catch (error) {
        next(error);
    }
};