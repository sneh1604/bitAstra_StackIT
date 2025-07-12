const Question = require('../models/Question.model');
const Answer = require('../models/Answer.model');
const Tag = require('../models/Tag.model');
const User = require('../models/User.model');
const { createNotification } = require('../services/notification.service');

// @desc    Get all questions
// @route   GET /api/questions
// @access  Public
exports.getQuestions = async (req, res, next) => {
    try {
        console.log('getQuestions called with query:', req.query);
        
        // Filtering
        let query;
        let queryStr = JSON.stringify(req.query);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
        query = Question.find(JSON.parse(queryStr)).populate('author', 'username avatar reputation').populate('tags');

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            console.log('Sorting by:', sortBy);
            query = query.sort(sortBy);
        } else {
            console.log('Using default sort: -createdAt (newest first)');
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Question.countDocuments();

        console.log(`Pagination: page=${page}, limit=${limit}, total=${total}`);

        query = query.skip(startIndex).limit(limit);

        // Executing query
        const questions = await query;
        console.log(`Found ${questions.length} questions`);

        // Pagination result
        const pagination = {};
        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        // If no questions found, return empty array instead of error
        if (questions.length === 0) {
            console.log('No questions found in database');
            return res.status(200).json({
                success: true,
                count: 0,
                pagination,
                data: []
            });
        }

        res.status(200).json({
            success: true,
            count: questions.length,
            pagination,
            data: questions
        });
    } catch (error) {
        console.error('Error in getQuestions:', error);
        next(error);
    }
};

// @desc    Create sample questions for testing
// @route   POST /api/questions/sample
// @access  Public
exports.createSampleQuestions = async (req, res, next) => {
    try {
        const User = require('../models/User.model');
        const Tag = require('../models/Tag.model');
        
        // Create sample user if not exists
        let sampleUser = await User.findOne({ username: 'sampleuser' });
        if (!sampleUser) {
            sampleUser = await User.create({
                username: 'sampleuser',
                email: 'sample@example.com',
                password: 'password123'
            });
        }

        // Create sample tags if not exist
        const tagNames = ['javascript', 'react', 'nodejs', 'python', 'mongodb'];
        const tags = [];
        for (const tagName of tagNames) {
            let tag = await Tag.findOne({ name: tagName });
            if (!tag) {
                tag = await Tag.create({ name: tagName });
            }
            tags.push(tag._id);
        }

        // Sample questions
        const sampleQuestions = [
            {
                title: 'How to use React hooks effectively?',
                description: 'I\'m new to React and want to understand how to use hooks like useState and useEffect properly. Can someone explain with examples?',
                author: sampleUser._id,
                tags: [tags[1]], // react
                views: 150,
                votes: 5
            },
            {
                title: 'MongoDB connection issues in Node.js',
                description: 'I\'m having trouble connecting to MongoDB from my Node.js application. The connection keeps timing out. Here\'s my code...',
                author: sampleUser._id,
                tags: [tags[2], tags[4]], // nodejs, mongodb
                views: 89,
                votes: 3
            },
            {
                title: 'JavaScript async/await best practices',
                description: 'What are the best practices for using async/await in JavaScript? I want to avoid common pitfalls and write clean code.',
                author: sampleUser._id,
                tags: [tags[0]], // javascript
                views: 234,
                votes: 8
            },
            {
                title: 'Python list comprehension vs for loops',
                description: 'When should I use list comprehension vs traditional for loops in Python? Which is more readable and performant?',
                author: sampleUser._id,
                tags: [tags[3]], // python
                views: 67,
                votes: 2
            }
        ];

        const createdQuestions = await Question.create(sampleQuestions);
        console.log(`Created ${createdQuestions.length} sample questions`);

        res.status(201).json({
            success: true,
            message: `Created ${createdQuestions.length} sample questions`,
            data: createdQuestions
        });
    } catch (error) {
        console.error('Error creating sample questions:', error);
        next(error);
    }
};

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Public
exports.getQuestion = async (req, res, next) => {
    try {
        const question = await Question.findById(req.params.id)
            .populate('author', 'username avatar reputation')
            .populate('tags')
            .populate({
                path: 'answers',
                populate: {
                    path: 'author',
                    select: 'username avatar reputation'
                }
            });

        if (!question) {
            return res.status(404).json({ success: false, error: 'Question not found' });
        }

        // Increment view count
        question.views += 1;
        await question.save();

        res.status(200).json({
            success: true,
            data: question
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create question
// @route   POST /api/questions
// @access  Private
exports.createQuestion = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.author = req.user.id;

        // Process tags
        if (req.body.tags && req.body.tags.length > 0) {
            const tagIds = await processTags(req.body.tags);
            req.body.tags = tagIds;
        }

        const question = await Question.create(req.body);

        res.status(201).json({
            success: true,
            data: question
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private
exports.updateQuestion = async (req, res, next) => {
    try {
        let question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ success: false, error: 'Question not found' });
        }

        // Make sure user is question owner or admin
        if (question.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to update this question' });
        }

        // Process tags if they're being updated
        if (req.body.tags && req.body.tags.length > 0) {
            const tagIds = await processTags(req.body.tags);
            req.body.tags = tagIds;
        }

        question = await Question.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: question
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private
exports.deleteQuestion = async (req, res, next) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ success: false, error: 'Question not found' });
        }

        // Make sure user is question owner or admin
        if (question.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to delete this question' });
        }

        // Delete all answers and votes associated with this question
        await Answer.deleteMany({ question: question._id });
        await Vote.deleteMany({ question: question._id });

        await question.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Search questions
// @route   GET /api/questions/search
// @access  Public
exports.searchQuestions = async (req, res, next) => {
    try {
        const { q, tag } = req.query;

        let query = {};

        if (q) {
            query.$text = { $search: q };
        }

        if (tag) {
            const tagDoc = await Tag.findOne({ name: tag });
            if (tagDoc) {
                query.tags = tagDoc._id;
            }
        }

        const questions = await Question.find(query)
            .populate('author', 'username avatar')
            .populate('tags')
            .sort('-createdAt')
            .limit(20);

        res.status(200).json({
            success: true,
            count: questions.length,
            data: questions
        });
    } catch (error) {
        next(error);
    }
};

// Helper function to process tags
const processTags = async (tags) => {
    const tagIds = [];

    for (const tagName of tags) {
        let tag = await Tag.findOne({ name: tagName.toLowerCase() });

        if (!tag) {
            tag = await Tag.create({ name: tagName.toLowerCase() });
        }

        tagIds.push(tag._id);
    }

    return tagIds;
};