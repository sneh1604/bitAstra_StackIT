const Notification = require('../models/Notification.model');
const User = require('../models/User.model');

class NotificationService {
    // Create basic notification (your existing function enhanced)
    static async createNotification({ recipient, sender, type, question, answer, comment, voteValue, title, message, priority, expiresAt, metadata }) {
        let text;

        switch (type) {
            case 'answer':
                text = `${sender.username} answered your question`;
                break;
            case 'comment':
                text = `${sender.username} commented on your ${question ? 'question' : 'answer'}`;
                break;
            case 'mention':
                text = `${sender.username} mentioned you in a comment`;
                break;
            case 'vote':
                text = `${sender.username} ${voteValue === 1 ? 'upvoted' : 'downvoted'} your ${question ? 'question' : 'answer'}`;
                break;
            case 'accept':
                text = `${sender.username} accepted your answer`;
                break;
            case 'admin':
                text = title || 'New admin notification';
                break;
            case 'system':
                text = title || 'New system notification';
                break;
            default:
                text = 'New notification';
        }

        try {
            const notification = await Notification.create({
                recipient,
                sender,
                type,
                question,
                answer,
                comment,
                text,
                title,
                message,
                priority: priority || 'medium',
                expiresAt,
                metadata
            });

            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    // Automated notification for new answers
    static async notifyQuestionAuthor(questionId, answerId, answerAuthorId) {
        try {
            const Question = require('../models/Question.model');
            const question = await Question.findById(questionId).populate('author');
            const answerAuthor = await User.findById(answerAuthorId);

            if (!question || question.author._id.toString() === answerAuthorId.toString()) {
                return; // Don't notify if author answers their own question
            }

            await this.createNotification({
                recipient: question.author._id,
                sender: {
                    _id: answerAuthor._id,
                    username: answerAuthor.username
                },
                type: 'answer',
                question: questionId,
                answer: answerId
            });
        } catch (error) {
            console.error('Error notifying question author:', error);
        }
    }

    // Automated notification for new comments
    static async notifyCommentTarget(targetId, targetType, commentAuthorId, commentText) {
        try {
            let targetDoc;
            if (targetType === 'question') {
                const Question = require('../models/Question.model');
                targetDoc = await Question.findById(targetId).populate('author');
            } else if (targetType === 'answer') {
                const Answer = require('../models/Answer.model');
                targetDoc = await Answer.findById(targetId).populate('author');
            }

            if (!targetDoc || targetDoc.author._id.toString() === commentAuthorId.toString()) {
                return; // Don't notify if commenting on own content
            }

            const commentAuthor = await User.findById(commentAuthorId);

            await this.createNotification({
                recipient: targetDoc.author._id,
                sender: {
                    _id: commentAuthor._id,
                    username: commentAuthor.username
                },
                type: 'comment',
                question: targetType === 'question' ? targetId : targetDoc.question,
                answer: targetType === 'answer' ? targetId : null,
                comment: commentText.substring(0, 100) // Truncate long comments
            });
        } catch (error) {
            console.error('Error notifying comment target:', error);
        }
    }

    // Automated notification for mentions
    static async notifyMentionedUsers(content, authorId, questionId, answerId = null) {
        try {
            const mentionRegex = /@(\w+)/g;
            const mentions = content.match(mentionRegex);

            if (!mentions) return;

            const usernames = mentions.map(mention => mention.substring(1));
            const users = await User.find({ username: { $in: usernames } });
            const author = await User.findById(authorId);

            for (const user of users) {
                if (user._id.toString() !== authorId.toString()) {
                    await this.createNotification({
                        recipient: user._id,
                        sender: {
                            _id: author._id,
                            username: author.username
                        },
                        type: 'mention',
                        question: questionId,
                        answer: answerId,
                        comment: content.substring(0, 100)
                    });
                }
            }
        } catch (error) {
            console.error('Error notifying mentioned users:', error);
        }
    }

    // Automated notification for votes
    static async notifyVoteReceived(targetId, targetType, voterId, voteValue) {
        try {
            let targetDoc;
            if (targetType === 'question') {
                const Question = require('../models/Question.model');
                targetDoc = await Question.findById(targetId).populate('author');
            } else if (targetType === 'answer') {
                const Answer = require('../models/Answer.model');
                targetDoc = await Answer.findById(targetId).populate('author');
            }

            if (!targetDoc || targetDoc.author._id.toString() === voterId.toString()) {
                return; // Don't notify if voting on own content
            }

            const voter = await User.findById(voterId);

            await this.createNotification({
                recipient: targetDoc.author._id,
                sender: {
                    _id: voter._id,
                    username: voter.username
                },
                type: 'vote',
                question: targetType === 'question' ? targetId : targetDoc.question,
                answer: targetType === 'answer' ? targetId : null,
                voteValue: voteValue
            });
        } catch (error) {
            console.error('Error notifying vote received:', error);
        }
    }

    // Automated notification for accepted answers
    static async notifyAnswerAccepted(answerId, questionAuthorId) {
        try {
            const Answer = require('../models/Answer.model');
            const answer = await Answer.findById(answerId).populate('author');
            const questionAuthor = await User.findById(questionAuthorId);

            if (!answer || answer.author._id.toString() === questionAuthorId.toString()) {
                return;
            }

            await this.createNotification({
                recipient: answer.author._id,
                sender: {
                    _id: questionAuthor._id,
                    username: questionAuthor.username
                },
                type: 'accept',
                question: answer.question,
                answer: answerId
            });
        } catch (error) {
            console.error('Error notifying answer accepted:', error);
        }
    }

    // Create admin notification (manual)
    static async createAdminNotification(data) {
        try {
            const notification = await this.createNotification({
                ...data,
                type: 'admin'
            });
            return notification;
        } catch (error) {
            console.error('Error creating admin notification:', error);
            throw error;
        }
    }

    // Create system notification (automated)
    static async createSystemNotification(data) {
        try {
            const notification = await this.createNotification({
                ...data,
                type: 'system'
            });
            return notification;
        } catch (error) {
            console.error('Error creating system notification:', error);
            throw error;
        }
    }

    // Bulk create notifications for multiple users
    static async createBulkNotification(data, userIds = null) {
        try {
            let recipients;
            if (userIds) {
                recipients = userIds;
            } else {
                // Get all active users
                const users = await User.find({ isActive: true }, '_id');
                recipients = users.map(user => user._id);
            }

            const notifications = [];
            for (const recipientId of recipients) {
                const notification = await this.createNotification({
                    ...data,
                    recipient: recipientId,
                    type: data.type || 'admin'
                });
                notifications.push(notification);
            }

            return notifications.length;
        } catch (error) {
            console.error('Error creating bulk notifications:', error);
            throw error;
        }
    }

    // Get user notification preferences (for future enhancement)
    static async getUserNotificationPreferences(userId) {
        try {
            const user = await User.findById(userId);
            return user.notificationPreferences || {
                answers: true,
                comments: true,
                mentions: true,
                votes: true,
                accept: true,
                admin: true
            };
        } catch (error) {
            console.error('Error getting user notification preferences:', error);
            return {
                answers: true,
                comments: true,
                mentions: true,
                votes: true,
                accept: true,
                admin: true
            };
        }
    }

    // Check if user wants to receive this type of notification
    static async shouldNotifyUser(userId, notificationType) {
        try {
            const preferences = await this.getUserNotificationPreferences(userId);
            return preferences[notificationType] !== false;
        } catch (error) {
            console.error('Error checking notification preference:', error);
            return true; // Default to true if error
        }
    }

    // Enhanced notification with preference check
    static async createNotificationWithPreference(data) {
        try {
            const shouldNotify = await this.shouldNotifyUser(data.recipient, data.type);
            if (!shouldNotify) {
                return null;
            }

            return await this.createNotification(data);
        } catch (error) {
            console.error('Error creating notification with preference:', error);
            throw error;
        }
    }
}

// Legacy support - keeping your original function
const createNotification = async ({ recipient, sender, type, question, answer, comment, voteValue }) => {
    return await NotificationService.createNotification({
        recipient,
        sender,
        type,
        question,
        answer,
        comment,
        voteValue
    });
};

module.exports = {
    createNotification,
    NotificationService
};