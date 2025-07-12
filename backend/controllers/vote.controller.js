const Vote = require('../models/Vote.model');
const Question = require('../models/Question.model');
const Answer = require('../models/Answer.model');
const User = require('../models/User.model');
const { createNotification } = require('../services/notification.service');

// @desc    Vote on a question
// @route   POST /api/vote/question/:id
// @access  Private
exports.voteQuestion = async (req, res, next) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ success: false, error: 'Question not found' });
        }

        // Check if user already voted
        let vote = await Vote.findOne({
            user: req.user.id,
            question: question._id
        });

        if (vote) {
            // If same vote value, remove the vote
            if (vote.value === req.body.value) {
                await vote.remove();
                question.votes -= vote.value;
                await question.save();

                return res.status(200).json({
                    success: true,
                    data: { votes: question.votes, userVote: null }
                });
            } else {
                // If different vote value, update the vote
                question.votes += req.body.value * 2; // Subtract previous and add new
                vote.value = req.body.value;
                await vote.save();
            }
        } else {
            // Create new vote
            vote = await Vote.create({
                user: req.user.id,
                question: question._id,
                value: req.body.value
            });
            question.votes += req.body.value;
        }

        await question.save();

        // Update user reputation
        if (question.author.toString() !== req.user.id) {
            await User.findByIdAndUpdate(question.author, {
                $inc: { reputation: req.body.value * 5 } // +5 or -5 reputation
            });

            // Create notification for question author
            await createNotification({
                recipient: question.author,
                sender: req.user.id,
                type: 'vote',
                question: question._id,
                voteValue: req.body.value
            });
        }

        res.status(200).json({
            success: true,
            data: { votes: question.votes, userVote: vote.value }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Vote on an answer
// @route   POST /api/vote/answer/:id
// @access  Private
exports.voteAnswer = async (req, res, next) => {
    try {
        const answer = await Answer.findById(req.params.id);

        if (!answer) {
            return res.status(404).json({ success: false, error: 'Answer not found' });
        }

        // Check if user already voted
        let vote = await Vote.findOne({
            user: req.user.id,
            answer: answer._id
        });

        if (vote) {
            // If same vote value, remove the vote
            if (vote.value === req.body.value) {
                await vote.remove();
                answer.votes -= vote.value;
                await answer.save();

                return res.status(200).json({
                    success: true,
                    data: { votes: answer.votes, userVote: null }
                });
            } else {
                // If different vote value, update the vote
                answer.votes += req.body.value * 2; // Subtract previous and add new
                vote.value = req.body.value;
                await vote.save();
            }
        } else {
            // Create new vote
            vote = await Vote.create({
                user: req.user.id,
                answer: answer._id,
                value: req.body.value
            });
            answer.votes += req.body.value;
        }

        await answer.save();

        // Update user reputation
        if (answer.author.toString() !== req.user.id) {
            await User.findByIdAndUpdate(answer.author, {
                $inc: { reputation: req.body.value * 10 } // +10 or -10 reputation for answers
            });

            // Create notification for answer author
            await createNotification({
                recipient: answer.author,
                sender: req.user.id,
                type: 'vote',
                question: answer.question,
                answer: answer._id,
                voteValue: req.body.value
            });
        }

        res.status(200).json({
            success: true,
            data: { votes: answer.votes, userVote: vote.value }
        });
    } catch (error) {
        next(error);
    }
};