import mongoose from 'mongoose';

const AnswerLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    questionId: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
    isCorrect: {
        type: Boolean,
        required: true,
    },
    blocked: {
        type: Boolean,
        default: false,
    },
    ip: {
        type: String,
        default: 'unknown',
    },
    userAgent: {
        type: String,
        default: 'unknown',
    },
    deviceInfo: {
        type: String,
        default: 'unknown',
    },
}, { timestamps: true });

export default mongoose.models.AnswerLog || mongoose.model('AnswerLog', AnswerLogSchema);
