const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: ['answer', 'comment', 'mention', 'vote', 'accept', 'admin', 'system'],
        required: true
    },
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    },
    answer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Answer'
    },
    comment: {
        type: String
    },
    // Enhanced fields for admin/system notifications
    title: {
        type: String,
        required: function () {
            return this.type === 'admin' || this.type === 'system';
        }
    },
    message: {
        type: String,
        required: function () {
            return this.type === 'admin' || this.type === 'system';
        }
    },
    // Priority for admin notifications
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    // Expiration for admin notifications
    expiresAt: {
        type: Date
    },
    // Metadata for different notification types
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient querying
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);