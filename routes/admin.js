import express from "express";
// FIX: Using named imports based on your middleware file structure
import { auth, adminOnly } from "../middleware/auth.js"; 
import User from "../models/User.js";
import LendSubmission from "../models/LendSubmission.js"; // 👈 NEW: Import the submission model
import Book from "../models/Book.js";

const router = express.Router();

// ----------------------------------------------------
// 1. DASHBOARD STATS
// ----------------------------------------------------
// Inside routes/admin.js

// 🧮 Admin summary – basic stats
router.get("/summary", auth, adminOnly, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const admins = await User.countDocuments({ role: "admin" });
        const pendingSubmissions = await LendSubmission.countDocuments({ status: "Pending Review" });
        
        // 🎯 FIX: Fetch the actual total number of books
        const totalBooks = await Book.countDocuments(); // Counts all documents in the Book collection

        res.json({
            totalUsers,
            admins,
            normalUsers: totalUsers - admins,
            totalBooks, // 👈 UPDATED
            borrowedBooks: 0, // Keep placeholder, as tracking this requires more logic
            pendingSubmissions,
        });
    } catch (err) {
        console.error("Admin summary error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// ----------------------------------------------------
// 2. USER MANAGEMENT ROUTES
// ----------------------------------------------------
// 👥 List all users (no passwords)
router.get("/users", auth, adminOnly, async (req, res) => {
    try {
        // Exclude the currently logged-in admin user's own ID from the list
        const users = await User.find({ _id: { $ne: req.user.id } }).select("-password"); 
        res.json({ users });
    } catch (err) {
        console.error("Admin users error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * @route DELETE /api/admin/user/:id
 * @desc Delete a user account (excluding admins).
 * @access Private/Admin
 */
router.delete("/user/:id", auth, adminOnly, async (req, res) => {
    try {
        const userId = req.params.id;
        const userToDelete = await User.findById(userId);

        if (!userToDelete) {
            return res.status(404).json({ message: "User not found." });
        }
        if (userToDelete.role === 'admin') {
             return res.status(403).json({ message: "Cannot delete an administrator account." });
        }

        await User.deleteOne({ _id: userId });
        // FUTURE STEP: Delete related records (orders, submissions, etc.)

        res.status(200).json({ message: `User ${userToDelete.name} deleted successfully.` });
    } catch (err) {
        console.error("Admin delete user error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * @route PATCH /api/admin/user/:id
 * @desc Update a user's name, email, or role. (Placeholder)
 * @access Private/Admin
 */
router.patch("/user/:id", auth, adminOnly, async (req, res) => {
    // This is a placeholder for future implementation of the 'Edit' button
    res.status(501).json({ message: "User modification route not yet implemented." });
});


// ----------------------------------------------------
// 3. LEND SUBMISSIONS MANAGEMENT
// ----------------------------------------------------
/**
 * @route GET /api/admin/lend-submissions/pending
 * @desc Fetch all submissions waiting for admin review.
 * @access Private/Admin
 */
router.get("/lend-submissions/pending", auth, adminOnly, async (req, res) => {
    try {
        // Fetch submissions that are explicitly pending review, sorted by oldest first
        const submissions = await LendSubmission.find({ status: 'Pending Review' })
            .populate('lender', 'name email') // Populate lender details (name and email)
            .sort({ createdAt: 1 }); 

        res.status(200).json(submissions);
    } catch (err) {
        console.error("Admin fetch submissions error:", err);
        res.status(500).json({ message: "Failed to fetch pending submissions." });
    }
});


// 🚨 FUTURE STEP: Add PATCH /lend-submissions/:id/approve and /reject routes here
router.patch('/lend-submissions/:id/:action', auth, adminOnly, async (req, res) => {
    const submissionId = req.params.id;
    const action = req.params.action; // 'approve' or 'reject'
    let newStatus = '';
    
    // 1. Determine the new status based on the action
    if (action === 'approve') {
        newStatus = 'Approved';
    } else if (action === 'reject') {
        newStatus = 'Rejected';
    } else {
        return res.status(400).json({ message: "Invalid action specified." });
    }

    try {
        // 2. Find the submission by ID and update its status
        const updatedSubmission = await LendSubmission.findByIdAndUpdate(
            submissionId,
            { 
                status: newStatus,
                reviewedAt: new Date(), // Set the review time
            },
            { new: true } // Return the updated document
        );

        if (!updatedSubmission) {
            return res.status(404).json({ message: "Lend submission not found." });
        }
        
        // 3. CRITICAL STEP FOR APPROVAL
        if (action === 'approve') {
            // FUTURE STEP: When approved, you must also copy/migrate the data 
            // into your main 'Book' collection, setting its 'borrowableCount' 
            // and marking it as 'lendingOnly'. This is a placeholder for now.
            console.log(`[APPROVAL LOG] Submission ID ${submissionId.slice(-6)} APPROVED. Now requires book inventory update.`);
        }

        res.status(200).json({ 
            message: `Submission ${updatedSubmission.status} successfully.`,
            submission: updatedSubmission,
        });

    } catch (err) {
        console.error(`Admin ${action} submission error:`, err);
        res.status(500).json({ message: `Failed to ${action} submission.` });
    }
});

export default router;