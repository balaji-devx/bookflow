import express from 'express';
// ✅ FINAL FIX: Use the correct NAMED IMPORT for the protect middleware
import { auth } from '../middleware/auth.js'; 
import LendSubmission from '../models/LendSubmission.js'; // Import the new Mongoose Model

const router = express.Router();

/**
 * @route POST /api/lend/submit
 * @desc Handles a user submitting a book to the system for lending review.
 * @access Private (Requires JWT and Authentication)
 */
router.post('/submit', auth, async (req, res) => {
    // 1. Data Destructuring & Validation (Basic Check)
    const { title, author, isbn, edition, condition, imgUrl, copies } = req.body;

    if (!title || !author || !isbn) {
        return res.status(400).json({ message: "Title, Author, and ISBN are required for submission." });
    }

    try {
        // Get the authenticated user's ID from the request object
        const lenderId = req.user.id;
        
        // Check if an identical ISBN is already awaiting review to prevent duplicates
        const existing = await LendSubmission.findOne({ isbn, status: 'Pending Review' });
        if (existing) {
            return res.status(409).json({ message: "This ISBN is already under review. Please wait for admin approval." });
        }

        // 2. Save Data to MongoDB Atlas
        const submission = await LendSubmission.create({
            lender: lenderId,
            title,
            author,
            isbn,
            edition,
            condition,
            imgUrl,
            copies,
        });
        
        // 3. Success Response (201 Created)
        console.log(`Lend submission saved to MongoDB from user ${lenderId}. Submission ID: ${submission._id}`);

        res.status(201).json({
            message: `Submission received. Thank you for lending!`,
            submission: submission,
        });

    } catch (err) {
        // Handles errors like Mongoose validation errors or database connection issues
        console.error("Lend submission processing error:", err);
        // Check for duplicate key error (11000) if needed, though Mongoose validation is usually sufficient
        res.status(500).json({ message: "Failed to process lending submission due to a server error." });
    }
});

router.get('/user/submissions', auth, async (req, res) => {
    try {
        // Find all submissions where the 'lender' field matches the authenticated user's ID
        const submissions = await LendSubmission.find({ lender: req.user.id })
            .sort({ createdAt: -1 }); // Newest first

        res.status(200).json(submissions);
    } catch (err) {
        console.error("Fetch submissions error:", err);
        res.status(500).json({ message: "Failed to retrieve lending submissions." });
    }
});

export default router;