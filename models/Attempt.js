import mongoose from 'mongoose';

const AttemptSchema = new mongoose.Schema({
    identifier: {
        type: String,
        required: true,
        unique: true, // IP + UserAgent hash or similar
    },
    count: {
        type: Number,
        default: 0,
    },
    blockedUntil: {
        type: Date,
        default: null,
    },
    // questions field removed - reverting to global count
    lastAttemptedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, { timestamps: true });

export default mongoose.models.Attempt || mongoose.model('Attempt', AttemptSchema);
