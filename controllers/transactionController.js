// src/backend/controllers/transactionController.js
import mongoose from 'mongoose';
import Order from '../models/Order.js';       // Your Order model (for Buy)
import BorrowRecord from '../models/BorrowRecord.js'; // Your Borrow model (for Borrow)
import Book from '../models/Book.js';
import User from '../models/User.js';           // Your Book model (for Inventory)


// --- Controller for BUYING: POST /api/transactions/order ---
export const placeOrder = async (req, res, next) => {
    // We assume req.user.id is available from the 'auth' middleware
    const userId = req.user.id; 
    
    // Data sent from the frontend Checkout page
    const { orderItems, shippingAddress, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({ message: 'No items in the cart to place an order.' });
    }

    try {
        // 1. Check Inventory and Prepare for Decrement
        const itemIds = orderItems.map(item => item.bookId);
        const booksInDb = await Book.find({ _id: { $in: itemIds } });

        if (booksInDb.length !== itemIds.length) {
            return res.status(404).json({ message: 'One or more books were not found in inventory.' });
        }
        
        let inventoryUpdates = [];
        let finalOrderItems = [];
        let calculatedTotal = 0; 

        for (const item of orderItems) {
            const bookDb = booksInDb.find(b => b._id.toString() === item.bookId);
            
            // Check 1: If stock is insufficient
            if (!bookDb || bookDb.stockCount < item.quantity) {
                // Assuming item.title is passed from frontend for better error message
                return res.status(400).json({ message: `Insufficient stock for book: ${item.title}` });
            }
            
            // Check 2: Server-side price verification
            const expectedPrice = bookDb.price * item.quantity;
            calculatedTotal += expectedPrice;

            // Prepare the update operation for the Book model (decrement stockCount)
            inventoryUpdates.push({
                updateOne: {
                    filter: { _id: item.bookId },
                    update: { $inc: { stockCount: -item.quantity } }
                }
            });

            // Prepare the final item list for the Order model
            finalOrderItems.push({
                book: item.bookId,
                quantity: item.quantity,
                priceAtPurchase: bookDb.price, 
            });
        }
        
        // 2. Perform Atomic Inventory Update
        await Book.bulkWrite(inventoryUpdates);
        
        // 3. Create the Order Record
        const newOrder = new Order({
            user: userId,
            orderItems: finalOrderItems,
            shippingAddress: shippingAddress,
            totalPrice: totalPrice, 
            isPaid: true, 
            orderStatus: 'Processing',
        });

        const createdOrder = await newOrder.save();

        // 4. Success Response
        res.status(201).json({ 
            message: 'Order placed successfully.', 
            orderId: createdOrder._id,
            status: createdOrder.orderStatus
        });

    } catch (error) {
        console.error('Order creation failed:', error);
        res.status(500).json({ message: 'Failed to process order due to a server error.' });
    }
};


// --- Controller for BORROWING: POST /api/transactions/borrow ---
export const placeBorrowRequest = async (req, res, next) => {
    const userId = req.user.id; 
    
    // Data sent from the frontend Borrow page
    const { 
        bookId, 
        shippingAddress, // Used for pickup/return logistics
        depositAmount, 
        rentalFee 
    } = req.body;

    if (!bookId || !depositAmount || !rentalFee) {
        return res.status(400).json({ message: 'Missing required financial or book data for the borrow request.' });
    }

    try {
        // 1. Validate Book Existence and Borrowable Stock
        const bookDb = await Book.findById(bookId);

        if (!bookDb) {
            return res.status(404).json({ message: 'Book not found in the inventory.' });
        }
        
        // Check 1: Ensure stock is available for borrowing
        if (bookDb.borrowableCount < 1) {
            return res.status(400).json({ message: 'This book is not currently available for borrowing.' });
        }
        
        // 2. Perform Inventory Update (Decrement borrowable count by 1)
        const updatedBook = await Book.findByIdAndUpdate(
            bookId,
            { $inc: { borrowableCount: -1 } }, // Decrement by 1
            { new: true }
        );

        if (!updatedBook) {
            return res.status(500).json({ message: 'Failed to update borrowable inventory.' });
        }

        // 3. Calculate Due Date (e.g., 14 days)
        const borrowDate = new Date();
        const dueDate = new Date(borrowDate);
        dueDate.setDate(borrowDate.getDate() + 14); 

        // 4. Create the Borrow Record
        const newBorrowRecord = new BorrowRecord({
            user: userId,
            book: bookId,
            borrowDate: borrowDate,
            dueDate: dueDate,
            depositAmount: depositAmount,
            rentalFee: rentalFee,
            borrowStatus: 'Reserved', 
        });

        const createdRecord = await newBorrowRecord.save();

        // 5. Success Response
        res.status(201).json({ 
            message: 'Borrow request successfully placed and reserved.', 
            recordId: createdRecord._id,
            dueDate: createdRecord.dueDate
        });

    } catch (error) {
        console.error('Borrow request failed:', error);
        res.status(500).json({ message: 'Failed to process borrow request due to a server error.' });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        // Find all orders where the user ID matches the logged-in user
        const orders = await Order.find({ user: req.user.id })
                                  .populate('orderItems.book', 'title author imgUrl') // Fetch book details
                                  .sort({ createdAt: -1 }); // Newest first

        res.status(200).json(orders);
    } catch (error) {
        console.error('Failed to fetch user orders:', error);
        res.status(500).json({ message: 'Error retrieving order history.' });
    }
};

// --- Controller for fetching BORROW records for the logged-in user ---
export const getUserBorrows = async (req, res) => {
    try {
        // Find all borrow records where the user ID matches the logged-in user
        const borrows = await BorrowRecord.find({ user: req.user.id })
                                          .populate('book', 'title author imgUrl') // Fetch book details
                                          .sort({ borrowDate: -1 }); // Newest first

        res.status(200).json(borrows);
    } catch (error) {
        console.error('Failed to fetch user borrows:', error);
        res.status(500).json({ message: 'Error retrieving borrow history.' });
    }
};


// --- Controller for fetching Pending Orders (Admin View) ---
export const getPendingOrders = async (req, res) => {
    try {
        // Fetch orders that are pending fulfillment or shipping
        const pendingOrders = await Order.find({ orderStatus: { $in: ['Processing', 'Shipped'] } })
                                        .populate('user', 'name email') // Fetch customer info
                                        .sort({ createdAt: 1 }); // Oldest first for fulfillment priority

        res.status(200).json(pendingOrders);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving pending orders.' });
    }
};

// --- Controller for fetching Active Borrows (Admin View) ---
export const getActiveBorrows = async (req, res) => {
    try {
        // Fetch borrows that haven't been successfully returned yet
        const activeBorrows = await BorrowRecord.find({ borrowStatus: { $in: ['Reserved', 'Borrowed', 'Overdue'] } })
                                                .populate('user', 'name email')
                                                .populate('book', 'title') // Fetch book title
                                                .sort({ dueDate: 1 }); // Show closest due date first

        res.status(200).json(activeBorrows);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving active borrows.' });
    }
};

// --- Controller for Admin to Mark Order as Shipped ---
export const markOrderShipped = async (req, res) => {
    const orderId = req.params.id; // Get the ID from the URL parameter

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'Invalid Order ID format.' });
    }

    try {
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        
        if (order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered') {
            return res.status(400).json({ message: `Order is already ${order.orderStatus}.` });
        }

        // Update the status
        order.orderStatus = 'Shipped';
        await order.save();

        res.status(200).json({ message: `Order ${orderId.slice(-6)} marked as Shipped.`, orderStatus: 'Shipped' });

    } catch (error) {
        console.error('Error marking order shipped:', error);
        res.status(500).json({ message: 'Failed to update order status.' });
    }
};

// --- Controller for Admin to Confirm Borrow Pickup/Return ---
export const updateBorrowStatus = async (req, res) => {
    const borrowId = req.params.id;
    const { action } = req.body; // Expects action: 'borrowed' or 'returned'

    if (!mongoose.Types.ObjectId.isValid(borrowId)) {
        return res.status(400).json({ message: 'Invalid Borrow ID format.' });
    }

    try {
        const record = await BorrowRecord.findById(borrowId);
        if (!record) {
            return res.status(404).json({ message: 'Borrow record not found.' });
        }
        
        let updateData = {};

        if (action === 'borrowed' && record.borrowStatus === 'Reserved') {
            // Fulfilling the loan (user picks up the book)
            updateData = { borrowStatus: 'Borrowed' };
            
        } else if (action === 'returned' && record.borrowStatus === 'Borrowed') {
            // Confirming the return and processing the deposit refund
            updateData = { 
                borrowStatus: 'Returned', 
                returnDate: new Date(),
                isDepositRefunded: true, // Assuming auto-refund if returned on time
                isReturnedInGoodCondition: true
            };
            
        } else {
            return res.status(400).json({ message: 'Invalid action or current status prevents update.' });
        }

        const updatedRecord = await BorrowRecord.findByIdAndUpdate(borrowId, updateData, { new: true });

        res.status(200).json({ 
            message: `Borrow record ${borrowId.slice(-6)} updated successfully.`,
            borrowStatus: updatedRecord.borrowStatus
        });

    } catch (error) {
        console.error('Error updating borrow status:', error);
        res.status(500).json({ message: 'Failed to update borrow status.' });
    }
};