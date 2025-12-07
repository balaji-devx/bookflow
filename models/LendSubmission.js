import mongoose from "mongoose";

const LendSubmissionSchema = new mongoose.Schema({
    // Link back to the user who submitted the book
    lender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    
    // Book details provided by the user
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    edition: { type: String },
    condition: { 
        type: String, 
        enum: ['New', 'Good', 'Acceptable'],
        default: 'Good'
    },
    imgUrl: { type: String },
    copies: { type: Number, default: 1, min: 1 },
    
    // Status for Admin Review
    status: {
        type: String,
        enum: ['Pending Review', 'Approved', 'Rejected'],
        default: 'Pending Review',
    },
    
    // Date the admin approved the book (if applicable)
    approvedAt: { type: Date },

}, { timestamps: true });

export default mongoose.model("LendSubmission", LendSubmissionSchema);