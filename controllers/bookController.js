// src/backend/controllers/bookController.js

import Book from '../models/Book.js'; // Assuming correct path to Book Model

// --- Controller 1: Fetch ALL Books (For the default Shop view) ---
export const getAllBooks = async (req, res) => {
    try {
        // Fetch all books where stockCount OR borrowableCount is greater than 0
        const books = await Book.find({ 
            $or: [{ stockCount: { $gt: 0 } }, { borrowableCount: { $gt: 0 } }]
        }).select('-__v'); // Exclude mongoose version field

        res.status(200).json(books);
    } catch (error) {
        console.error("Error fetching all books:", error);
        res.status(500).json({ message: "Failed to load book inventory." });
    }
};


// --- Controller 2: Search Books (For the /search endpoint) ---
export const searchBooks = async (req, res) => {
    try {
        const { q } = req.query; // Get the search query from the URL (?q=query_term)

        if (!q) {
            // If no query is provided (should hit getAllBooks, but we handle the case)
            return res.status(200).json([]); 
        }

        const searchQuery = q.trim();

        // Mongoose Query: Use $or to search multiple fields and $regex for flexible matching
        const results = await Book.find({
            $or: [
                // $options: 'i' makes the search case-insensitive
                { title: { $regex: searchQuery, $options: 'i' } }, 
                { author: { $regex: searchQuery, $options: 'i' } }
            ]
        }).select('-__v'); 

        res.status(200).json(results);
    } catch (error) {
        console.error("Error executing search:", error);
        res.status(500).json({ message: "Search failed due to a server error." });
    }
};