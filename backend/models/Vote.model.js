const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    value: {
        type: Number,
        enum: [-1, 1],
        required: true
    },
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    },
    answer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Answer'
    }
}, {
    timestamps: true
});

// Ensure a user can only vote once per question/answer
voteSchema.index({ user: 1, question: 1 }, { unique: true, partialFilterExpression: { question: { $exists: true } } });
voteSchema.index({ user: 1, answer: 1 }, { unique: true, partialFilterExpression: { answer: { $exists: true } } });

module.exports = mongoose.model('Vote', voteSchema);