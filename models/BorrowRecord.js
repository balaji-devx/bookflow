import mongoose from "mongoose";

const borrowRecordSchema = new mongoose.Schema({
  user: {
    // Links this record to the User who borrowed the book
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  book: {
    // Links to the specific Book that was borrowed
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book', 
    required: true,
  },
  // --- Date Tracking ---
  borrowDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    // When the book must be returned (e.g., 14 days later)
    type: Date,
    required: true, 
  },
  returnDate: {
    // Date book was actually returned (null until returned)
    type: Date, 
    default: null,
  },
  // --- Status & Condition Tracking (Crucial for Admin) ---
  borrowStatus: {
    type: String,
    enum: ['Reserved', 'Borrowed', 'Overdue', 'Returned', 'Lost'],
    default: 'Reserved',
  },
  isReturnedInGoodCondition: {
    // Assessed by Admin upon return; determines deposit refund
    type: Boolean,
    default: null, 
  },
  // --- Financial Tracking ---
  depositAmount: {
    type: Number,
    required: true, // The refundable security deposit amount
  },
  rentalFee: {
    type: Number,
    default: 0, // The non-refundable fee charged (from your calculation: Rs 25/book)
  },
  isDepositRefunded: {
    type: Boolean,
    default: false, // Set to true after Admin processes the refund
  }
}, { timestamps: true });

export default mongoose.model("BorrowRecord", borrowRecordSchema);