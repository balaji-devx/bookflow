import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: {
    // Links this order to the User who placed it
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  orderItems: [ 
    {
      book: {
        // Links to the specific book purchased
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book', 
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      priceAtPurchase: { 
        // Snapshot of the price to prevent historical mismatch if book price changes later
        type: Number,
        required: true,
      }
    }
  ],
  shippingAddress: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  // Crucial for delivery tracking and administration
  orderStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  isPaid: {
    type: Boolean,
    default: false, // Should be updated to true upon payment success
  }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);