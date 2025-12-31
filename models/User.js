import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name.'],
        lowercase: true, // Normalize for search
        trim: true,
    },
    displayName: {
        type: String,
        required: [true, 'Please provide a display name.'],
        trim: true,
    },
    gratitudeContent: {
        type: String,
        required: [true, 'Please provide gratitude content.'], // HTML content
    },
    questions: [{
        id: String,
        text: String,
        type: {
            type: String,
            enum: ['text', 'choice'],
            default: 'text',
        },
        options: [String], // For multiple choice
        answer: String, // Correct answer (normalized for text)
    }],
    isBlocked: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

// Index for faster name search
UserSchema.index({ name: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);
