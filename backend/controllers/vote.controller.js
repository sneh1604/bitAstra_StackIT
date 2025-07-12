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

        let previousVoteValue = 0;
        let isNewVote = false;

        if (vote) {
            // If same vote value, remove the vote
            if (vote.value === req.body.value) {
                previousVoteValue = vote.value;
                await vote.remove();
                question.votes -= vote.value;
                await question.save();

                return res.status(200).json({
                    success: true,
                    data: { votes: question.votes, userVote: null }
                });
            } else {
                // If different vote value, update the vote
                previousVoteValue = vote.value;
                question.votes += req.body.value * 2; // Subtract previous and add new
                vote.value = req.body.value;
                await vote.save();
            }
        } else {
            // Create new vote
            isNewVote = true;
            vote = await Vote.create({
                user: req.user.id,
                question: question._id,
                value: req.body.value
            });
            question.votes += req.body.value;
        }

        await question.save();

        // ===== ENHANCED NOTIFICATION AUTOMATION =====

        // Update user reputation
        if (question.author.toString() !== req.user.id) {
            await User.findByIdAndUpdate(question.author, {
                $inc: { reputation: req.body.value * 5 } // +5 or -5 reputation
            });

            // Only notify for upvotes or significant reputation changes
            const shouldNotify = req.body.value > 0 || // Upvotes
                (req.body.value < 0 && question.votes % 5 === 0); // Every 5th downvote

            if (shouldNotify) {
                await NotificationService.notifyVoteReceived(
                    question._id,
                    'question',
                    req.user.id,
                    req.body.value
                );
            }

            // Special milestone notifications
            if (question.votes === 10 || question.votes === 25 || question.votes === 50 || question.votes === 100) {
                await NotificationService.createSystemNotification({
                    recipient: question.author,
                    title: 'Milestone Achieved! 🎉',
                    message: `Your question "${question.title}" has reached ${question.votes} votes!`,
                    priority: 'high',
                    metadata: {
                        milestone: question.votes,
                        questionId: question._id,
                        type: 'vote_milestone'
                    }
                });
            }
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
        const answer = await Answer.findById(req.params.id).populate('question', 'title');

        if (!answer) {
            return res.status(404).json({ success: false, error: 'Answer not found' });
        }

        // Check if user already voted
        let vote = await Vote.findOne({
            user: req.user.id,
            answer: answer._id
        });

        let previousVoteValue = 0;
        let isNewVote = false;

        if (vote) {
            // If same vote value, remove the vote
            if (vote.value === req.body.value) {
                previousVoteValue = vote.value;
                await vote.remove();
                answer.votes -= vote.value;
                await answer.save();

                return res.status(200).json({
                    success: true,
                    data: { votes: answer.votes, userVote: null }
                });
            } else {
                // If different vote value, update the vote
                previousVoteValue = vote.value;
                answer.votes += req.body.value * 2; // Subtract previous and add new
                vote.value = req.body.value;
                await vote.save();
            }
        } else {
            // Create new vote
            isNewVote = true;
            vote = await Vote.create({
                user: req.user.id,
                answer: answer._id,
                value: req.body.value
            });
            answer.votes += req.body.value;
        }

        await answer.save();

        // ===== ENHANCED NOTIFICATION AUTOMATION =====

        // Update user reputation
        if (answer.author.toString() !== req.user.id) {
            await User.findByIdAndUpdate(answer.author, {
                $inc: { reputation: req.body.value * 10 } // +10 or -10 reputation for answers
            });

            // Only notify for upvotes or significant reputation changes
            const shouldNotify = req.body.value > 0 || // Upvotes
                (req.body.value < 0 && answer.votes % 5 === 0); // Every 5th downvote

            if (shouldNotify) {
                await NotificationService.notifyVoteReceived(
                    answer._id,
                    'answer',
                    req.user.id,
                    req.body.value
                );
            }

            // Special milestone notifications for answers
            if (answer.votes === 5 || answer.votes === 15 || answer.votes === 30 || answer.votes === 50) {
                await NotificationService.createSystemNotification({
                    recipient: answer.author,
                    title: 'Great Answer! 🌟',
                    message: `Your answer to "${answer.question.title}" has received ${answer.votes} votes!`,
                    priority: 'medium',
                    metadata: {
                        milestone: answer.votes,
                        answerId: answer._id,
                        questionId: answer.question._id,
                        type: 'answer_milestone'
                    }
                });
            }

            // Check if this answer is becoming the top answer
            const topAnswer = await Answer.findOne({
                question: answer.question._id
            }).sort({ votes: -1 });

            if (topAnswer && topAnswer._id.toString() === answer._id.toString() && answer.votes >= 3) {
                await NotificationService.createSystemNotification({
                    recipient: answer.author,
                    title: 'Top Answer! 🏆',
                    message: `Your answer is now the top-voted answer for "${answer.question.title}"!`,
                    priority: 'high',
                    metadata: {
                        answerId: answer._id,
                        questionId: answer.question._id,
                        votes: answer.votes,
                        type: 'top_answer'
                    }
                });
            }
        }

        res.status(200).json({
            success: true,
            data: { votes: answer.votes, userVote: vote.value }
        });
    } catch (error) {
        next(error);
    }
};