// src/backend/routes/bookRoutes.js (Finalized)

import express from 'express';
// 🎯 Import BOTH required functions
import { searchBooks, getAllBooks } from '../controllers/bookController.js'; 

const router = express.Router();

// Endpoint 1: GET /api/books/ (Default fetch all)
router.get('/', getAllBooks); // 👈 Registered the default route

// Endpoint 2: GET /api/books/search?q=query_term
router.get('/search', searchBooks);

export default router;