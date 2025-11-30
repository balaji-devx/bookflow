import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: String,
    required: true,
  },
  price: {
    type: Number, // Price for buying the book
    required: true,
  },
  stockCount: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  imgUrl: {
    type: String,
  },
  // We'll add a field to track how many copies are available for borrowing
  borrowableCount: { 
    type: Number,
    required: true,
    default: 0,
    min: 0,
  }
}, { timestamps: true });

export default mongoose.model("Book", bookSchema);