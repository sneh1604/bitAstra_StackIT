const Notification = require('../models/Notification.model');

const createNotification = async ({ recipient, sender, type, question, answer, comment, voteValue }) => {
    let text;

    switch (type) {
        case 'answer':
            text = `${sender.username} answered your question`;
            break;
        case 'comment':
            text = `${sender.username} commented on your answer`;
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
        default:
            text = 'New notification';
    }

    await Notification.create({
        recipient,
        sender,
        type,
        question,
        answer,
        comment,
        text
    });
};

module.exports = { createNotification };